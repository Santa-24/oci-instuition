# OCI Platform Production Security Architecture & Hardening Guide

> **Document Version:** 1.0.0  
> **Security Classification:** Confidential / Production Operations Standard  
> **Target Environment:** Multi-Tier Production Architecture (Vercel + Cloudflare + Cloudflare R2 + Supabase + Android/iOS)  
> **Last Updated:** September 2026

---

## 1. Threat Model & Attack Surface Analysis

The OCI Platform manages sensitive student educational records, payment/enrollment histories, proprietary video and lecture courseware, and faculty credentials. The security architecture enforces a strict **Zero-Trust** defense-in-depth model across all layers.

### 1.1 Attack Vectors & Mitigations

| Threat Vector | Potential Impact | Architecture Mitigation |
| :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | Cross-batch student data leaks, unauthorized access to paid lecture notes or exam answer sheets. | Enforced PostgreSQL Row Level Security (RLS) policies scoped strictly by user identity (`auth.uid()`) and verified batch enrollment joins. |
| **Bypass of Frontend Auth Checks** | Malicious users invoking admin APIs directly via curl or Postman. | Server-side GoTrue JWT token validation and database role verification (`admin`, `superadmin`) in Next.js Serverless route handlers before execution. |
| **Storage Hotlinking & Content Piracy** | Bulk scraping or unauthenticated sharing of copyrighted PDFs, question banks, and video lectures. | Private Cloudflare R2 buckets with zero public HTTP access (`r2.dev` disabled); files accessible only via short-lived (15–60 min) HMAC-SHA256 signed presigned URLs. |
| **Large Payload Denial of Service (DoS)** | Exhaustion of Vercel serverless execution limits via multi-megabyte file uploads. | Direct browser/mobile client-to-R2 presigned PUT uploads; zero binary data passes through Vercel serverless handlers. |
| **Credential Stuffing & Brute Force** | Compromise of faculty or administrative accounts. | Cloudflare WAF rate limiting (60 requests/minute on auth endpoints) + Supabase Auth brute force protection + Bot Fight Mode. |
| **Service Role Secret Leakage** | Complete database compromise. | Absolute separation: `SUPABASE_SERVICE_ROLE_KEY` and R2 secret credentials exist ONLY in server-side Vercel runtime environments, never in client bundles or mobile binaries. |

---

## 2. Supabase Authentication & Session Management

### 2.1 GoTrue JWT Lifecycle
* **Access Tokens:** Signed via HMAC-SHA256 with institutional secret. Lifespan configured to **3600 seconds (1 hour)** in Supabase Dashboard.
* **Refresh Tokens:** Single-use rotation enabled. Every token refresh revokes the prior refresh token. Lifespan configured to **30 days**.
* **Brute Force Defense:** Supabase Auth restricts failed login attempts to 10 per minute per IP address with exponential backoff.

### 2.2 Role-Based Access Control (RBAC)
User authorization operates on a two-tier verification hierarchy:
1. **App Metadata Role:** Cached inside JWT `user_metadata.role` or `app_metadata.role` for fast edge evaluation.
2. **Database Source of Truth:** `public.user_roles` and `public.teachers` tables enforce permissions at the PostgreSQL transaction level, preventing role spoofing even if a client-side JWT is manipulated.

---

## 3. Comprehensive Row Level Security (RLS) Policy Matrix

Every table in the PostgreSQL database has Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

> [!CAUTION]
> Insecure fallback policies such as `CREATE POLICY ... USING (true)` or `FOR ALL USING (true)` have been completely eliminated from all production tables.

### 3.1 Hardened Table Policy Matrix

| Database Table | Operations Allowed | Target Role / Principal | Policy Logic & Security Constraint |
| :--- | :--- | :--- | :--- |
| **`public.profiles`** | `SELECT` | Authenticated | Can view own profile (`id = auth.uid()`) OR Admin/Teacher can view all enrolled students. |
| | `UPDATE` | Authenticated | Users can update only their own non-privileged profile data (`id = auth.uid()`). |
| **`public.user_roles`** | `SELECT` | Authenticated | Can view own roles (`user_id = auth.uid()`) OR Admin can view all. |
| | `ALL` | Admin Only | Full control reserved for users verified as `admin` in `user_roles`. |
| **`public.batches`** | `SELECT` | Authenticated | Active batches viewable by all enrolled students and teachers. |
| | `ALL` | Admin Only | Only admins can create, modify, or archive batches. |
| **`public.batch_enrollments`** | `SELECT` | Authenticated | Students can only query their own enrollments (`student_id = auth.uid()`). |
| | `ALL` | Admin Only | Only admins can enroll or drop students from batches. |
| **`public.study_materials`** | `SELECT` | Student / Faculty | **Strict Batch Isolation:** Students can only SELECT materials assigned to a batch they are currently enrolled in (`batch_id IN (SELECT batch_id FROM batch_enrollments WHERE student_id = auth.uid())`). |
| | `ALL` | Faculty / Admin | Teachers can manage materials they authored; Admins have full access. |
| **`public.assignments`** | `SELECT` | Student / Faculty | Students can only query assignments assigned to their enrolled batch. |
| | `ALL` | Faculty / Admin | Assigned faculty or admin can create/grade assignments. |
| **`public.student_submissions`**| `SELECT`, `INSERT`, `UPDATE` | Student | Students can only insert and view their own submissions (`student_id = auth.uid()`). |
| | `SELECT`, `UPDATE` | Faculty / Admin | Faculty assigned to the batch can view and grade student submissions. |
| **`public.live_classes`** | `SELECT` | Student / Faculty | Visible only if student is enrolled in the target batch or is the assigned instructor. |
| | `ALL` | Faculty / Admin | Assigned teacher or admin can schedule/modify classes. |
| **`public.recorded_classes`** | `SELECT` | Student / Faculty | Visible only if student is enrolled in the target batch or is the assigned instructor. |
| | `ALL` | Faculty / Admin | Only authorized faculty and admin can publish recordings. |
| **`public.teachers`** | `SELECT` | Public / Auth | Active faculty public profiles viewable; administrative fields masked. |
| | `ALL` | Admin Only | Only administrators can hire, edit, or terminate teacher profiles. |
| **`public.app_versions`** | `SELECT` | Public / Anon | Anyone can check for updates. |
| | `ALL` | Admin Only | Only administrators can publish new APK/app releases. |
| **`public.r2_storage_objects`**| `SELECT` | Authenticated | Enforces ownership and batch visibility for uploaded assets. |
| | `ALL` | Admin Only | Full metadata auditing. |

---

## 4. Server-Side Admin Authorization Hardening

### 4.1 Elimination of Unauthorized Fallbacks

In earlier iterations, server-side API endpoints in `admin/lib/auth/api-auth.ts` contained a critical vulnerability where an empty or missing token yielded `{ authorized: true }`. This has been completely refactored to enforce **Zero-Trust** rejection:

```typescript
// admin/lib/auth/api-auth.ts (Production Hardened)
export async function verifyAdminRequest(
  request: NextRequest, 
  requiredRole: 'admin' | 'superadmin' | 'teacher' = 'admin'
): Promise<AuthVerificationResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Unauthorized: Missing or malformed Bearer token' };
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // 1. Verify JWT with Supabase GoTrue
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized: Invalid or expired session token' };
  }

  // 2. Query database source of truth for administrative privilege
  const { data: roleRecords } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = roleRecords?.map(r => r.role) || [];
  const isAdmin = roles.includes('admin') || roles.includes('superadmin');

  if (!isAdmin) {
    return { authorized: false, error: 'Forbidden: Insufficient administrative privileges' };
  }

  return { authorized: true, user, role: 'admin' };
}
```

### 4.2 Endpoint Protection Audit
All API routes under `/api/admin/*` invoke `verifyAdminRequest` as the first line of execution. Any request without a valid administrative Bearer token is immediately rejected with HTTP `401 Unauthorized` or HTTP `403 Forbidden`.

---

## 5. Cloudflare R2 Storage Security Architecture

### 5.1 Zero Public Direct Bucket Access
* Public access via `*.r2.dev` is **strictly disabled** for all production buckets.
* All public assets are routed exclusively through Cloudflare Custom Domains (`cdn.ociinstitute.com` and `download.ociinstitute.com`).
* Cloudflare edge security rules inspect every request to custom domains before routing to R2.

### 5.2 Private Presigned URL Security
For sensitive materials (PDFs, study notes, student submissions, database backups):
* **No Direct Object Exposure:** Private buckets (`oci-private-materials`, `oci-student-submissions`, `oci-db-backups`) have no custom domain or public endpoint.
* **Cryptographic Signatures:** URLs are generated using the AWS S3 SDK with SigV4 (HMAC-SHA256) signatures.
* **Strict TTL Limits:**
  * **Upload Presigned URLs:** `900 seconds` (15 minutes). Once expired, no file can be uploaded.
  * **Download Presigned URLs:** `3600 seconds` (60 minutes). After 1 hour, the link becomes completely invalid, preventing unauthorized link sharing.
* **Scoped Upload Paths:** Presigned upload generation strictly validates the target S3 key path (e.g., forcing `materials/{batch_id}/{uuid}-{filename}`), preventing arbitrary path traversal.

---

## 6. Network & Edge Security Configuration

### 6.1 Cloudflare Edge Protection
* **Cloudflare Anycast Network:** Absorbs Layer 3 and Layer 4 volumetric DDoS attacks automatically.
* **SSL/TLS Strict Mode:** Guarantees that communication between Cloudflare Edge and Vercel/Supabase origin is fully encrypted with valid, non-expired CA certificates.
* **HSTS (HTTP Strict Transport Security):** Enforced with `max-age=63072000; includeSubDomains; preload` preventing SSL stripping attacks.

### 6.2 Cloudflare WAF Rate Limiting
Configured rate limits protect against automated credential abuse:
* Route: `/auth/v1/*` $\rightarrow$ Max 60 requests / 60 seconds per IP address.
* Route: `/api/admin/*` $\rightarrow$ Max 120 requests / 60 seconds per IP address.
* Exceed Action: Cloudflare Managed Challenge (Turnstile verification) or HTTP 429 Block.

---

## 7. Secrets Management & Zero-Leak Policy

### 7.1 Separation of Keys

| Key / Secret | Environment | Permitted Locations | Restricted Locations |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Client JS, Flutter Mobile, Public Website | N/A (Protected by PostgreSQL RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Side Only | Vercel Serverless Environment Variables (`admin`), Supabase Edge Functions | **NEVER in Client JS, GitHub, Flutter App, or Public Web** |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Server-Side Only | Vercel Serverless Environment Variables (`admin`), GitHub Actions Secrets | **NEVER in Client JS, GitHub, Flutter App, or Public Web** |
| `UPLOAD_KEYSTORE_PASSWORD` | CI/CD Only | GitHub Actions Secrets, Local Developer Vault | **NEVER in Git Repository** |

### 7.2 Source Control & Git Auditing
* All `.env`, `.env.local`, and `key.properties` files are strictly excluded via `.gitignore`.
* Pre-commit checks ensure no API keys or private keys are accidentally committed.

---

## 8. Incident Response & Security Audit Procedures

### 8.1 Compromised Credential Protocol
If `SUPABASE_SERVICE_ROLE_KEY` or `CLOUDFLARE_R2_SECRET_ACCESS_KEY` is suspected of compromise:
1. **Immediate Rotation:**
   * Log into Supabase Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **API** $\rightarrow$ Click **Generate new Secret Key**.
   * Log into Cloudflare Dashboard $\rightarrow$ **R2** $\rightarrow$ **Manage R2 API Tokens** $\rightarrow$ Revoke old token and generate a replacement.
2. **Update Vercel Production Variables:**
   * Update the environment variables in `oci-admin` on Vercel.
   * Trigger an immediate redeployment (`vercel --prod`).
3. **Session Invalidation:**
   * Execute `supabase.auth.admin.signOut(userId)` or revoke all refresh tokens in PostgreSQL.

### 8.2 Security Audit Verification Checklist

- [ ] All database tables have RLS enabled with 0 bypasses.
- [ ] No table contains `FOR ALL USING (true)`.
- [ ] All `/api/admin/*` endpoints strictly enforce `verifyAdminRequest`.
- [ ] `r2.dev` public bucket access is disabled across all R2 buckets.
- [ ] Cloudflare SSL is set to **Full (Strict)**.
- [ ] HSTS and security headers enabled on both Next.js applications.
- [ ] Mobile app communicates with Supabase exclusively via `anonKey` and authenticated user sessions.
- [ ] No service-role or R2 credentials present in compiled Flutter binaries or public web assets.
