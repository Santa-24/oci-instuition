# OCI Platform — Master System Architecture

## 1. Executive Architecture Topology

The **Odisha Competitive Institute (OCI)** digital platform ecosystem is architected around high-performance separation of concerns, global edge security, and serverless scalability.

```
                                  INTERNET
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │     CLOUDFLARE      │
                          │   DNS / CDN / SSL   │
                          │   WAF / Rate Limit  │
                          │     Edge Caching    │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         ┌─────────────────────┐           ┌─────────────────────┐
         │       VERCEL        │           │       RENDER        │
         │   Next.js Frontends │           │   Backend Node/API  │
         │   • Public Website  │           │   • CBT Exam Engine │
         │   • Student Portal  │           │   • Attendance Calc │
         │   • Faculty Portal  │           │   • Privileged Ops  │
         │   • Admin Dashboard │           │   • Redis & FCM SDK │
         └──────────┬──────────┘           └──────────┬──────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                          ┌─────────────────────┐
                          │      SUPABASE       │
                          │  PostgreSQL 15+ DB  │
                          │  Supabase Auth      │
                          │  Supabase Storage   │
                          │  Supabase Realtime  │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         ┌─────────────────────┐           ┌─────────────────────┐
         │      FIREBASE       │           │    UPSTASH REDIS    │
         │     FCM Push /      │           │     Rate Limiting   │
         │   Web Push Alerts   │           │    & Query Caching  │
         └─────────────────────┘           └─────────────────────┘
```

---

## 2. Component Responsibility Matrix

| Infrastructure Layer | Platform | Primary Responsibilities | Anti-Patterns (What it must NOT do) |
|---|---|---|---|
| **Global Edge & Security** | **Cloudflare** | DNS routing, CDN static caching, SSL/TLS termination, Web Application Firewall (WAF), rate-limiting DDoS mitigation. | Must not run heavy business logic or replace Render backend. |
| **Frontend UI / SSR** | **Vercel** | Next.js 14/16 App Router delivery, Server-Side Rendering (SSR), Static Site Generation (SSG), Student, Faculty, and Admin command center interfaces. | Must not hold database service-role secrets or execute long synchronous computational jobs. |
| **Backend API Engine** | **Render** | CBT Exam Engine (response scoring, negative marking, accuracy, All India Rank generation), Attendance aggregator, Firebase Admin SDK dispatcher, Upstash Redis caching. | Must not serve static frontend assets, heavy videos, or raw PDFs directly. |
| **Data Platform** | **Supabase** | Primary relational PostgreSQL data store, Row Level Security (RLS) enforcement, Auth session issuance, file blob storage, and Realtime websocket broadcasts. | Must not use SQLite or secondary transactional databases. |
| **Push Notifications** | **Google Firebase** | Firebase Cloud Messaging (FCM) push notification delivery to Android, iOS, and Web Push subscribers. | Must not store notification business history without PostgreSQL records. |
| **Transient Caching** | **Upstash Redis** | High-speed cache for course catalogs, public website bundles, and API rate-limiting tokens. | Must not act as source of truth; all authoritative data resides in PostgreSQL. |

---

## 3. Data Propagation Workflows

### 3.1 Admin Course & Notice Creation
1. Admin authors a course/notice in `/admin/*`.
2. Admin UI sends authenticated REST call directly to Supabase via RLS or through Render API.
3. Supabase persists record to `courses` or `announcements` table.
4. Supabase Realtime emits change event over WebSocket to active mobile clients and web dashboards.
5. Student dashboard immediately renders the new course and notice without manual page refresh.

### 3.2 CBT Mock Exam Submission & Ranking Engine
1. Student attempts CBT examination in `/student/exams`.
2. On submit, answers payload is transmitted to Render API (`POST /api/exams/submit`).
3. Render Exam Engine fetches correct answer keys from Supabase `questions` table using Service Role key.
4. Engine calculates score (+4 for correct, -1 for negative, 0 for unattempted) and accuracy percentage.
5. Engine persists scorecard to `exam_results` and triggers stored procedure `calculate_exam_air_rankings(exam_id)`.
6. Updated All India Rank (AIR) is computed and returned instantly to student scorecard UI.

### 3.3 Study Material Upload & Access
1. Faculty uploads PDF/Notes in `/faculty/materials`.
2. File blob is uploaded directly to Supabase Storage bucket `study-materials` using authenticated token.
3. Metadata record is inserted into `study_materials` table.
4. Enrolled students query `study_materials` filtered by their assigned `batch_id`.
5. Student downloads verified document directly from Supabase Storage CDN.

---

## 4. Security Boundaries

- **Public Client Safe**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- **Server-Only Restricted**: `SUPABASE_SECRET_KEY`, `FIREBASE_PRIVATE_KEY`, `REDIS_TOKEN`, `JWT_SECRET`.
- **Database Access Model**: All client connections use anonymous keys bounded by PostgreSQL Row Level Security (RLS). Server-to-server operations on Render use the Service Role key to perform privileged calculations.
