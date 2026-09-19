# OCI Platform — Security Architecture & Runbook

This document defines the end-to-end security architecture, threat model, data protection controls, secret isolation standards, and compliance policies enforced across the **Odisha Competitive Institute (OCI)** digital ecosystem.

---

## 1. Security Architecture & Threat Defense Layers

```
[ Internet Traffic ]
        │
        ▼
[ Layer 1: Cloudflare Edge (WAF & DDoS Mitigation) ]
  • Strict SSL/TLS (Origin CA certificates)
  • WAF Managed Rules (OWASP Top 10 mitigation)
  • IP-based rate limiting on API endpoints
  • Automatic bot fight mode & geo-blocking
        │
        ├──────────────────────────────┐
        ▼                              ▼
[ Layer 2A: Vercel CDN/Edge ]    [ Layer 2B: Render Backend Service ]
  • Client-safe public assets       • Helmet security headers
  • Static & dynamic SSR            • Strict CORS origin whitelist
  • Zero private secret exposure    • Upstash Redis rate limiting
        │                              │
        ├──────────────────────────────┘
        ▼
[ Layer 3: Supabase Cloud & PostgreSQL Database ]
  • Database accessible via TLS 1.3 only
  • 100% Row Level Security (RLS) on all 27 tables
  • Multi-tenant role-based access control (RBAC)
  • Supabase Storage bucket access control
```

---

## 2. Row Level Security (RLS) Policies

Every table in the PostgreSQL database has Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`). No query can bypass RLS unless executed with the `service_role` key, which is restricted exclusively to the Render backend service.

### Summary of Access Control Matrix

| Table Category | Tables | Public Access | Student Access | Faculty Access | Parent Access | Admin Access |
|---|---|---|---|---|---|---|
| **Identity & Access** | `profiles`, `user_roles` | None | Self only (Read) | Self only (Read) | Self only (Read) | Full (Read/Write) |
| **Academic Structure**| `courses`, `subjects`, `batches` | Active courses (Read) | Enrolled batches (Read) | Assigned batches (Read) | Linked student batches (Read) | Full (Read/Write) |
| **Student Roster** | `students` | None | Self only (Read) | Assigned batch students (Read) | Linked child only (Read) | Full (Read/Write) |
| **Examinations** | `exams`, `questions` | None | Published batch exams (Read/Submit) | Author / assigned batch (Read/Write) | Linked child exam reports (Read) | Full (Read/Write) |
| **Exam Results** | `exam_results` | None | Own results only (Read) | Assigned batch results (Read) | Linked child results (Read) | Full (Read/Write) |
| **Attendance** | `attendance`, `live_classes` | None | Own attendance / enrolled class | Assigned batch attendance (Write) | Linked child attendance (Read) | Full (Read/Write) |
| **Learning Materials**| `study_materials`, `recorded_classes` | None | Enrolled batch materials (Read) | Own uploaded materials (Read/Write) | None | Full (Read/Write) |
| **Website Content** | `website_content`, `testimonials`, `faqs` | Published items (Read) | Read | Read | Read | Full (Read/Write) |
| **Security & Audits**| `audit_logs` | None | None | None | None | Full (Read/Write) |

---

## 3. Storage Bucket Access Control

All media uploaded to Supabase Storage is partitioned into isolated buckets with granular security policies:

1. **`avatars`** (Public Read, Authenticated User Write to own folder `auth.uid()/*`).
2. **`course-thumbnails`** (Public Read, Admin Write only).
3. **`study-materials`** (Authenticated Read for enrolled students/teachers, Faculty/Admin Write).
4. **`assignments`** (Enrolled Student Upload to own folder, Teacher/Admin Read/Grade).
5. **`media-library`** (Public Read for published assets, Admin Write only).

---

## 4. Secret Isolation & Zero-Leakage Policy

OCI strictly enforces secret isolation between client bundles and server runtimes:

### Public vs. Private Credentials

| Variable | Scope | Safe for Client? | Justification |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (Frontends) | **YES** | Public API gateway URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel (Frontends) | **YES** | Safe because RLS enforces data boundaries per JWT |
| `NEXT_PUBLIC_RENDER_BACKEND_URL` | Vercel (Frontends) | **YES** | Public API endpoint for Render engine |
| `SUPABASE_SERVICE_ROLE_KEY` | Render (Backend) Only | **NO — CRITICAL** | Bypasses all RLS policies; NEVER bundle in client |
| `DATABASE_URL` | Render (Backend) Only | **NO — CRITICAL** | Direct PostgreSQL connection string |
| `UPSTASH_REDIS_REST_TOKEN` | Render (Backend) Only | **NO — CRITICAL** | Cache & rate limiting auth |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Render (Backend) Only | **NO — CRITICAL** | Push notification broadcast privileges |

### Audit Verification Checklist
- [x] All `.env.local` files in `admin/` and `public-website/` stripped of `SUPABASE_SERVICE_ROLE_KEY`.
- [x] `.gitignore` verified to exclude `.env`, `.env.local`, and `*.pem` across all packages.
- [x] Automated git pre-commit checks to reject any commit containing high-entropy service keys.

---

## 5. Backend HTTP Security & CORS

The Express backend on Render (`backend/src/server.js`) enforces:

### Helmet Security Headers
- **`Content-Security-Policy`**: Disables unsafe script and object injection.
- **`Strict-Transport-Security`** (HSTS): Enforces HTTPS with 1-year max age and subdomains.
- **`X-Frame-Options`**: Set to `DENY` to prevent clickjacking.
- **`X-Content-Type-Options`**: Set to `nosniff` to prevent MIME-type confusion attacks.

### Cross-Origin Resource Sharing (CORS)
- Origin reflection or wildcard `*` is **prohibited** in production.
- Only the configured frontend domains (e.g. `https://admin.oci.org.in`, `https://oci.org.in`) and approved local development ports are whitelisted.

---

## 6. Rate Limiting & Abuse Prevention

### Backend API Rate Limiter
- Implemented using **Upstash Redis** sliding window counters (`backend/src/config/redis.js`).
- Default limit: 100 requests per minute per IP address.
- Auth / Exam Submission endpoints: 20 requests per minute per user/IP.
- Fallback: If Redis is temporarily unreachable, an in-memory LRU cache maintains local rate limits to prevent fail-open vulnerability.

### Cloudflare Edge Rate Limiting
- Configured at the Cloudflare DNS proxy level for `/api/*` routes.
- Mitigation action: Managed Challenge (Turnstile) or HTTP 429 after exceeding burst thresholds.

---

## 7. Incident Response & Security Logging

1. **Audit Logs Table (`audit_logs`)**:
   - Records administrative actions: student enrolment, fee management, role modifications, and exam publishing.
   - Logs timestamp, user ID, IP address, user agent, action type, entity type, and delta payload.
2. **Alerting**:
   - Critical errors and unexpected authorization failures trigger automated alerts to administrators via push notifications.
