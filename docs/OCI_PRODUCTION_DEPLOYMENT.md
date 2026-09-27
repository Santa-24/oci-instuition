# OCI Platform Production Deployment Guide

> **Document Version:** 1.0.0  
> **Target Environment:** Multi-Tier Production Architecture (Vercel + Cloudflare + Cloudflare R2 + Supabase + Android/iOS)  
> **Classification:** Production Operations Manual  
> **Last Updated:** September 2026

---

## 1. Executive Summary & Architecture Topology

The Odisha Competitive Institute (OCI) Platform is an enterprise-grade EdTech ecosystem engineered for zero-maintenance serverless scalability, low latency across India and globally, zero egress fees for large media assets, and bank-grade data security.

### 1.1 Architecture Topology Overview

```text
                               +-------------------------------------------------------------+
                               |                    END-USERS & CLIENTS                      |
                               +-------------------------------------------------------------+
                                      |                      |                       |
                             [Public Web Visitors]    [Admins & Staff]        [Mobile Students]
                                      |                      |                       |
                                      v                      v                       v
                         +-------------------------------------------------------------------+
                         |                 CLOUDFLARE GLOBAL ANYCAST EDGE                    |
                         |  (DNS / DDoS Mitigation / WAF / SSL Full-Strict / Edge Caching)   |
                         +-------------------------------------------------------------------+
                                   |                         |                       |
                   +---------------+                         |                       +-------------+
                   |                                         |                                     |
                   v                                         v                                     v
+-------------------------------------+   +-------------------------------------+   +-----------------------------+
|          VERCEL PLATFORM            |   |          VERCEL PLATFORM            |   |     CLOUDFLARE R2 CDN       |
|    Project: `oci-public-website`    |   |         Project: `oci-admin`        |   | (Custom Domains via Edge)   |
|-------------------------------------|   |-------------------------------------|   |-----------------------------|
| * Next.js SSG / SSR                 |   | * Next.js Admin Dashboard (App Dir) |   | * cdn.ociinstitute.com      |
| * Domain: ociinstitute.com          |   | * Domain: admin.ociinstitute.com    |   |   (Public static banners,   |
| * Domain: www.ociinstitute.com      |   | * Serverless Auth Middleware        |   |    thumbnails, icons)       |
| * Edge ISR Caching                  |   | * S3 Presigned URL Provisioning     |   | * download.ociinstitute.com |
+-------------------------------------+   +-------------------------------------+   |   (Android APK releases)    |
                   \                                         /                      +-----------------------------+
                    \                                       /                                      ^
                     \                                     /                                       |
                      v                                   v                                        |
+-------------------------------------------------------------------------------------+            |
|                                SUPABASE ENTERPRISE PAAS                             |            |
|-------------------------------------------------------------------------------------|            |
| * PostgreSQL 15 Database (Relational schema, indexes, audit triggers)               |            |
| * Row Level Security (RLS) policies (Batch isolation, zero-trust data access)       |            |
| * GoTrue Auth Service (JWT issuance, refresh tokens, role-based metadata)           |            |
| * Supabase Realtime (Live attendance, exam proctoring, broadcast channels)          |            |
| * Edge Functions (Deno Runtime for secure headless tasks & presigned token issuing) |------------+
+-------------------------------------------------------------------------------------+ (Private Presigned
                                                                                         Upload / Download)
```

### 1.2 Core Infrastructure Allocation

| Layer | Service / Host | Responsibility |
| :--- | :--- | :--- |
| **Public Portal** | **Vercel** (`public-website/`) | Static landing page, course catalogs, faculty showcases, institute blog, leads intake. |
| **Admin Portal** | **Vercel** (`admin/`) | Academic management, batch scheduling, student/teacher records, exam generation, APK release publisher. |
| **Database & Auth** | **Supabase** | PostgreSQL relational database, Row Level Security, Auth (GoTrue), Realtime subscriptions. |
| **Storage & Media** | **Cloudflare R2** | Zero-egress S3-compatible storage for public assets, APK distributions, and private courseware. |
| **DNS & Security** | **Cloudflare** | Global Anycast DNS, SSL Full (Strict), WAF rate limiting, DDoS shield, Bot Fight Mode. |
| **Mobile App** | **Flutter (Android / iOS)** | Direct Supabase Auth & PostgreSQL access via RLS; direct R2 asset fetching via short-lived URLs. |

---

## 2. Production Domain & DNS Mapping

All DNS management for `ociinstitute.com` MUST be hosted on **Cloudflare**. Proxying (`Orange Cloud`) must be active for all web traffic to benefit from Cloudflare's WAF and Anycast caching.

### 2.1 Complete DNS Records Table

| Record Type | Hostname / Subdomain | Target / Destination Value | Cloudflare Proxy | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (`ociinstitute.com`) | `76.76.21.21` | **Proxied (Orange)** | Points root domain to Vercel production edge |
| **CNAME** | `www` | `cname.vercel-dns.com` | **Proxied (Orange)** | Points `www` subdomain to Vercel |
| **CNAME** | `admin` | `cname.vercel-dns.com` | **Proxied (Orange)** | Points Admin Dashboard to Vercel |
| **CNAME** | `cdn` | `<bucket-public>.r2.cloudflarestorage.com` (or R2 Custom Domain) | **Proxied (Orange)** | Custom domain for public banners, PDFs, assets |
| **CNAME** | `download` | `<bucket-releases>.r2.cloudflarestorage.com` (or R2 Custom Domain) | **Proxied (Orange)** | Custom domain for high-speed Android APK downloads |
| **CNAME** | `supabase` *(Optional)* | `<project-ref>.supabase.co` | **DNS Only (Grey)** | Custom vanity domain for Supabase API (if configured) |
| **TXT** | `_vercel` | `vc-domain-verify=ociinstitute.com...` | **DNS Only (Grey)** | Vercel domain verification token |
| **TXT** | `@` | `v=spf1 include:_spf.google.com ~all` | **DNS Only (Grey)** | SPF record for institutional email delivery |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@ociinstitute.com` | **DNS Only (Grey)** | DMARC security policy |

> [!IMPORTANT]
> When proxying Vercel domains through Cloudflare:
> 1. Set SSL/TLS encryption mode to **Full (Strict)** in the Cloudflare Dashboard.
> 2. Ensure **SSL/TLS Recommender** is enabled.
> 3. Do **NOT** enable Cloudflare Rocket Loader or Auto Minify for HTML/JS on Vercel subdomains to prevent hydration mismatches with Next.js.

---

## 3. Vercel Deployment Configuration

Both `public-website` and `admin` portals are deployed as independent projects on Vercel from the monorepo root.

### 3.1 Project 1: Public Website (`oci-public-website`)

* **Framework Preset:** Next.js
* **Root Directory:** `public-website`
* **Build Command:** `npm run build`
* **Output Directory:** `.next` (default)
* **Install Command:** `npm install`
* **Node.js Version:** `20.x`

#### Environment Variables (`public-website`):

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ociinstitute.com
NEXT_PUBLIC_ADMIN_URL=https://admin.ociinstitute.com
NEXT_PUBLIC_SUPABASE_URL=https://zddetimqjrcbbshvdfbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...[REDACTED_PUBLIC_ANON_KEY]
NEXT_PUBLIC_CLOUDFLARE_CDN_URL=https://cdn.ociinstitute.com
NEXT_PUBLIC_APP_DOWNLOAD_URL=https://download.ociinstitute.com/releases/latest/oci-student-portal.apk
```

### 3.2 Project 2: Admin Portal (`oci-admin`)

* **Framework Preset:** Next.js
* **Root Directory:** `admin`
* **Build Command:** `npm run build`
* **Output Directory:** `.next` (default)
* **Install Command:** `npm install`
* **Node.js Version:** `20.x`

#### Environment Variables (`admin`):

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.ociinstitute.com
NEXT_PUBLIC_SUPABASE_URL=https://zddetimqjrcbbshvdfbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...[REDACTED_PUBLIC_ANON_KEY]

# Server-Side Only Secrets (Never prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...[REDACTED_SERVICE_ROLE_KEY]
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_BUCKET_PUBLIC=oci-public-assets
CLOUDFLARE_R2_BUCKET_PRIVATE=oci-private-materials
CLOUDFLARE_R2_BUCKET_RELEASES=oci-app-releases
CLOUDFLARE_R2_BUCKET_STUDENTS=oci-student-submissions
CLOUDFLARE_R2_BUCKET_BACKUPS=oci-db-backups
CLOUDFLARE_R2_PUBLIC_DOMAIN=https://cdn.ociinstitute.com
CLOUDFLARE_R2_RELEASES_DOMAIN=https://download.ociinstitute.com
```

### 3.3 Production HTTP Security Headers

Both applications enforce strict security headers configured in `next.config.js` / `next.config.mjs`:

```javascript
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  },
]
```

---

## 4. Cloudflare Configuration & Hardening

### 4.1 SSL/TLS Settings
1. Go to **Cloudflare Dashboard** $\rightarrow$ **SSL/TLS** $\rightarrow$ **Overview**.
2. Select **Full (strict)** mode.
3. Under **Edge Certificates**:
   * **Always Use HTTPS:** `Enabled`
   * **Minimum TLS Version:** `TLS 1.3` (or `TLS 1.2` minimum)
   * **Opportunistic Encryption:** `Enabled`
   * **TLS 1.3:** `Enabled`
   * **Automatic HTTPS Rewrites:** `Enabled`

### 4.2 Caching & Edge Rules
Create Cloudflare Cache Rules under **Caching** $\rightarrow$ **Cache Rules**:

* **Rule 1: Static CDN Assets (`cdn.ociinstitute.com`)**
  * *Expression:* `(http.host eq "cdn.ociinstitute.com")`
  * *Cache Eligibility:* Cache everything
  * *Edge Cache TTL:* Override origin, TTL = 1 Month (`2592000` seconds)
  * *Browser Cache TTL:* Override origin, TTL = 7 Days (`604800` seconds)
* **Rule 2: APK Download Distribution (`download.ociinstitute.com`)**
  * *Expression:* `(http.host eq "download.ociinstitute.com")`
  * *Cache Eligibility:* Cache everything
  * *Edge Cache TTL:* Override origin, TTL = 14 Days
  * *Browser Cache TTL:* Override origin, TTL = 1 Day

### 4.3 Web Application Firewall (WAF) & Rate Limiting
Create WAF Custom Rules under **Security** $\rightarrow$ **WAF**:

1. **Protect Admin Routes:**
   * *Expression:* `(http.request.uri.path contains "/api/admin/")`
   * *Action:* Managed Challenge if Threat Score $> 10$ or IP not in India/Admin geolocation.
2. **Authentication Rate Limiting:**
   * *Expression:* `(http.request.uri.path contains "/auth/v1/" or http.request.uri.path contains "/api/auth")`
   * *Rate:* 60 requests per 1 minute per IP.
   * *Action:* Block / Challenge for 5 minutes if exceeded.
3. **Bot Fight Mode:** Enable under **Security** $\rightarrow$ **Bots**. Automatically drops known malicious bots and scrapers.

---

## 5. Cloudflare R2 Storage Architecture

Cloudflare R2 provides zero-egress cost, high-speed S3-compatible object storage.

### 5.1 Bucket Topology

| Bucket Identifier | Access Level | Custom Domain | Purpose |
| :--- | :--- | :--- | :--- |
| `oci-public-assets` | **Public** | `cdn.ociinstitute.com` | Institutional logos, course banners, teacher avatars, public PDFs |
| `oci-app-releases` | **Public** | `download.ociinstitute.com` | Production Android APK and desktop application binaries |
| `oci-private-materials` | **Private** | *None (Direct S3 API)* | Copyrighted lecture notes, premium test papers, solution keys |
| `oci-student-submissions` | **Private** | *None (Direct S3 API)* | Student exam upload answer scripts, assignment submissions |
| `oci-db-backups` | **Private** | *None (Direct S3 API)* | Automated PostgreSQL logical dumps and schema archives |

> [!CAUTION]
> Under no circumstances enable public `r2.dev` access in production. All public content MUST be delivered via verified Cloudflare custom subdomains (`cdn.ociinstitute.com`, `download.ociinstitute.com`) protected by Cloudflare WAF and Edge Caching.

### 5.2 R2 CORS Policy Configuration

Apply the following CORS policy to `oci-public-assets`, `oci-private-materials`, and `oci-student-submissions` via the Cloudflare Dashboard or AWS S3 CLI:

```json
[
  {
    "AllowedOrigins": [
      "https://ociinstitute.com",
      "https://www.ociinstitute.com",
      "https://admin.ociinstitute.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Type",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 5.3 Lifecycle Rules
Configure Lifecycle Rules under each bucket:
* **Abort Incomplete Multipart Uploads:** Clean up aborted uploads after **7 days**.
* **Temporary Cache / Logs:** Expire and delete after **30 days** in scratch buckets.

---

## 6. End-to-End Asset Workflows

### 6.1 Direct-to-R2 Presigned Upload Workflow (Bypassing Vercel 4.5MB Limits)

Vercel Serverless Functions enforce a hard 4.5MB request payload limit. Large files (50MB+ APKs, 100MB lecture PDFs, high-res videos) MUST never pass through Vercel.

```text
[Browser / Admin Web]                [Vercel Serverless API]             [Cloudflare R2]
         |                                     |                                |
         |-- 1. POST /api/admin/storage/ ----->|                                |
         |      presigned-upload (file info)   |                                |
         |                                     |-- 2. Verify Admin Token        |
         |                                     |-- 3. S3 PutObjectCommand       |
         |                                     |      presigned URL (TTL=900s)  |
         |<-- 4. Return uploadUrl & publicKey -|                                |
         |                                                                      |
         |-- 5. Direct HTTP PUT with File Stream ------------------------------>|
         |<-- 6. HTTP 200 OK (ETag Verified) -----------------------------------|
         |                                                                      |
         |-- 7. Persist file metadata in Supabase (record ID, key, size) ------>| [Supabase DB]
```

#### Code Implementation:
* API Route: `admin/app/api/admin/storage/presigned-upload/route.ts`
* S3 Presigner Client: `admin/lib/r2/r2-client.ts`

### 6.2 Secure Private Material Download Workflow

Private materials are never publicly accessible:

```text
[Mobile App / Web Student]           [Vercel / Edge Function]            [Cloudflare R2]
         |                                     |                                |
         |-- 1. GET /api/storage/ ------------>|                                |
         |      presigned-download?id=XYZ      |                                |
         |      (Bearer JWT)                   |                                |
         |                                     |-- 2. Validate Supabase JWT     |
         |                                     |-- 3. Verify Batch Enrollment   |
         |                                     |      in PostgreSQL RLS         |
         |                                     |-- 4. S3 GetObjectCommand       |
         |                                     |      presigned URL (TTL=3600s) |
         |<-- 5. Return short-lived signedUrl -|                                |
         |                                                                      |
         |-- 6. GET signedUrl ------------------------------------------------->|
         |<-- 7. Binary Stream delivered directly to client --------------------|
```

### 6.3 Mobile APK Release Deployment Workflow

1. Admin builds release APK locally or via CI/CD.
2. Admin logs into `https://admin.ociinstitute.com/admin/app-releases`.
3. Admin clicks **Upload New Release**:
   * Specifies Version (e.g., `1.0.8`), Build Number (`8`), Release Notes, and `Is Critical Update` toggle.
   * Drag-and-drops `app-release.apk`.
4. The file streams directly into Cloudflare R2 bucket `oci-app-releases` under `releases/v1.0.8/oci-student-portal-v1.0.8.apk`.
5. An automated pointer updates `releases/latest/oci-student-portal.apk`.
6. Record inserted into Supabase `app_versions` table with SHA256 checksum, file size, and download URL.
7. Mobile apps querying `AppUpdateService` immediately detect the update and prompt users.

---

## 7. Supabase Production Hardening

### 7.1 Database Migration Deployment
All database schema, indexes, functions, and RLS policies must be applied directly via the Supabase Dashboard SQL Editor or Supabase CLI:

```bash
# Apply initial complete schema
supabase db push

# Apply production hardening migration
psql -h db.zddetimqjrcbbshvdfbh.supabase.co -U postgres -d postgres -f supabase/production_hardening_migration.sql
```

### 7.2 Database Connection Pooling (PgBouncer)
* For serverless functions in Vercel, connect using **Transaction Mode** connection pooling on port `6543`.
* For direct administrative migrations, connect on direct session port `5432`.

### 7.3 Backups & Disaster Recovery
* **Automated Daily Backups:** Enable Supabase automated daily backups (retained for 7 days on Pro plan).
* **Point-in-Time Recovery (PITR):** Enable PITR with 7-day or 30-day granularity for instant state restoration in case of accidental data loss.
* **Secondary Disaster Dump to R2:**
  Execute a daily automated GitHub Action to dump the database schema and data to Cloudflare R2 bucket `oci-db-backups`:

```bash
pg_dump --clean --if-exists "postgresql://postgres:$DB_PASS@db.zddetimqjrcbbshvdfbh.supabase.co:5432/postgres" | gzip | aws s3 cp - s3://oci-db-backups/daily/$(date +%Y%m%d)-backup.sql.gz --endpoint-url https://$CF_ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## 8. Mobile App Production Release (Android & iOS)

### 8.1 Android Production Build (AAB & APK)

#### Prerequisites:
1. Ensure `android/key.properties` contains production keystore parameters:
   ```properties
   storePassword=YOUR_SECURE_STORE_PASSWORD
   keyPassword=YOUR_SECURE_KEY_PASSWORD
   keyAlias=oci_release_key
   storeFile=/path/to/upload-keystore.jks
   ```
2. Keystore file is NOT checked into source control (`.gitignore` enforced).

#### Build Commands:

```bash
# Navigate to app directory
cd app

# Clean previous build artifacts
flutter clean
flutter pub get

# 1. Build Google Play Store Bundle (.aab)
flutter build appbundle --release \
  --dart-define=ENVIRONMENT=production \
  --dart-define=SUPABASE_URL=https://zddetimqjrcbbshvdfbh.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...[REDACTED] \
  --dart-define=CLOUDFLARE_CDN_URL=https://cdn.ociinstitute.com \
  --dart-define=CLOUDFLARE_DOWNLOAD_URL=https://download.ociinstitute.com

# 2. Build Direct-Install Universal APK (.apk) for website distribution
flutter build apk --release \
  --dart-define=ENVIRONMENT=production \
  --dart-define=SUPABASE_URL=https://zddetimqjrcbbshvdfbh.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...[REDACTED] \
  --dart-define=CLOUDFLARE_CDN_URL=https://cdn.ociinstitute.com \
  --dart-define=CLOUDFLARE_DOWNLOAD_URL=https://download.ociinstitute.com

# Output Artifacts:
# AAB: app/build/app/outputs/bundle/release/app-release.aab
# APK: app/build/app/outputs/flutter-apk/app-release.apk
```

### 8.2 iOS Production Build (TestFlight / App Store)

```bash
cd app
flutter clean
flutter pub get
cd ios
pod install --repo-update
cd ..

flutter build ipa --release \
  --dart-define=ENVIRONMENT=production \
  --dart-define=SUPABASE_URL=https://zddetimqjrcbbshvdfbh.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...[REDACTED] \
  --dart-define=CLOUDFLARE_CDN_URL=https://cdn.ociinstitute.com \
  --dart-define=CLOUDFLARE_DOWNLOAD_URL=https://download.ociinstitute.com
```

---

## 9. Monitoring, Observability & Incident Response

### 9.1 Observability Integrations
1. **Cloudflare Analytics:** Real-time monitoring of requests, bandwidth, WAF threat events, and edge cache hit ratios. Target: $> 85\%$ cache hit ratio for `cdn.ociinstitute.com`.
2. **Vercel Web Analytics & Speed Insights:** Real-time Core Web Vitals (LCP, FID, CLS) and serverless invocation failure rates.
3. **Supabase Dashboard Metrics:** Real-time monitoring of CPU utilization, RAM, connection pool exhaustion, and slow queries.

### 9.2 Zero-Downtime Rollback Strategy

* **Vercel Instant Rollback:**
  In the event of a frontend regression:
  1. Open Vercel Project Dashboard $\rightarrow$ **Deployments**.
  2. Locate the last known good deployment.
  3. Click `...` $\rightarrow$ **Promote to Production**. Deployment switches globally in $< 5$ seconds without rebuilding.

* **Mobile Critical Rollback:**
  If an application bug affects live users:
  1. Open Admin Portal $\rightarrow$ **App Releases**.
  2. Post an immediate patch release or toggle `Is Critical Update = true` with a minimum version requirement.
  3. Users on outdated versions are immediately prompted with a non-dismissible modal directing them to download the hotfix APK from `download.ociinstitute.com`.

---

## 10. Production Go-Live Checklist

- [ ] All DNS records mapped in Cloudflare with SSL set to **Full (Strict)**.
- [ ] Vercel projects `oci-public-website` and `oci-admin` connected to production domains.
- [ ] All environment variables configured on Vercel; zero sensitive keys prefixed with `NEXT_PUBLIC_`.
- [ ] Cloudflare R2 buckets created (`oci-public-assets`, `oci-app-releases`, `oci-private-materials`, `oci-student-submissions`, `oci-db-backups`).
- [ ] Custom domains `cdn.ociinstitute.com` and `download.ociinstitute.com` linked to respective buckets.
- [ ] R2 CORS policies deployed.
- [ ] Supabase production hardening migration applied (`production_hardening_migration.sql`).
- [ ] RLS verified on all tables with zero insecure `USING (true)` policies.
- [ ] Serverless direct presigned upload verified with 10MB+ file.
- [ ] Android release APK generated, signed, and uploaded to `download.ociinstitute.com`.
- [ ] Mobile app configured with production Supabase URL and keys; tested on physical Android device.
