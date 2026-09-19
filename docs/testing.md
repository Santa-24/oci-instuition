# OCI Platform — Testing Strategy & Quality Assurance Runbook

This document details the testing framework, verification procedures, automated test scripts, and manual QA checklists required to validate the **Odisha Competitive Institute (OCI)** platform across all deployment targets.

---

## 1. Testing Hierarchy & Standards

```
                      ┌─────────────────────────┐
                      │   End-to-End (E2E) UI   │  Cypress / Playwright /
                      │     & Full Workflows    │  scripts/verify_e2e.mjs
                      └────────────┬────────────┘
                                   │
                      ┌────────────▼────────────┐
                      │    Integration Tests    │  Backend API + Supabase
                      │ (Exam Engine, Services) │  PostgreSQL + Upstash Redis
                      └────────────┬────────────┘
                                   │
                      ┌────────────▼────────────┐
                      │    Static Verification  │  TypeScript Compiler (`tsc`)
                      │   & Production Builds   │  Next.js Production Build
                      └─────────────────────────┘
```

---

## 2. Automated Test Runbooks

### A. Next.js Frontend Production Builds
Ensure all TypeScript types, React Server/Client boundaries, and dynamic route parameters compile without warnings or errors.

```bash
# 1. Admin, Faculty & Student Web Portal
cd admin
npm run build

# Expected Output:
# ✓ Compiled successfully
# ✓ Generating static pages (59/59)
# Route (app) size table with 0 errors.

# 2. Public Facing Marketing Website
cd ../public-website
npm run build

# Expected Output:
# ✓ Compiled successfully
# ✓ Generating static pages (11/11)
```

### B. Backend API & Engine Verification
Verify the Express service on Render, including Redis connectivity, Supabase PostgreSQL queries, and the CBT exam grading algorithm.

```bash
# Start backend locally or verify against live Render deployment
cd backend
npm start

# In another terminal:
curl -i http://localhost:8080/health
```

**Expected Health Output (HTTP 200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2026-09-18T04:20:00.000Z",
  "version": "1.0.0",
  "services": {
    "supabase": "CONNECTED",
    "redis": "CONNECTED"
  },
  "uptime": 12.34
}
```

### C. Master End-to-End Automation Suite
OCI provides an automated multi-step verification script (`scripts/verify_e2e.mjs`) that exercises all integrated subsystems:

```bash
# Run from repository root
node scripts/verify_e2e.mjs
```

**What the script validates:**
1. **Backend Health**: Queries `GET /health` and validates `status === "UP"`.
2. **Database Connectivity**: Validates query access to `courses`, `batches`, and `profiles`.
3. **Course & Batch Lifecycle**: Queries courses, active batches, and ensures data relationships exist.
4. **CBT Exam Engine Evaluation**:
   - Submits a test answer payload with known correct/incorrect answers.
   - Asserts that positive marks, negative penalties, accuracy percentage, and AIR rankings are calculated precisely.
5. **Attendance Engine**:
   - Posts a batch attendance sheet for students.
   - Asserts correct persistence and percentage calculation.
6. **Public Enquiry Pipeline**:
   - Simulates a prospective student submitting an enquiry from the public website.
   - Verifies the enquiry is persisted with status `NEW` and visible to administrators.
7. **Push Notification Broadcast**:
   - Sends a targeted notification and verifies dispatch logs.

---

## 3. Manual QA & Verification Checklist

Before certifying any deployment as production-ready, perform the following manual test scenarios:

### 1. Authentication & Role Routing
- [ ] Visit `/login` on the portal application.
- [ ] Enter Admin credentials -> Verify redirection to `/admin/dashboard`.
- [ ] Enter Faculty credentials -> Verify redirection to `/faculty/dashboard`.
- [ ] Enter Student credentials -> Verify redirection to `/student/dashboard`.
- [ ] Attempt unauthenticated navigation to `/admin/*` -> Verify redirect to `/login`.

### 2. Academic Management (Admin)
- [ ] Create a new Course (e.g. *OPSC ASO Foundation Batch*).
- [ ] Create a new Batch under that Course.
- [ ] Enrol a Student into the Batch.
- [ ] Verify the Student appears in the enrolled roster.

### 3. CBT Mock Test Flow
- [ ] **Faculty/Admin**: Navigate to `/admin/mock-exams` or `/faculty/exams`.
- [ ] Create an Exam with 10 questions, setting correct options and positive/negative mark values.
- [ ] Set Exam status to `PUBLISHED`.
- [ ] **Student**: Log in and navigate to `/student/exams`.
- [ ] Start the test -> verify question navigation, timer countdown, and answer selection.
- [ ] Click **Submit Exam**.
- [ ] Verify instant result generation displaying Total Score, Accuracy, and Rank.
- [ ] Navigate to `/student/results` -> Confirm scorecard history is updated.

### 4. Live Video Classes
- [ ] **Faculty**: Go to `/faculty/classes` and click **Launch Live Classroom**.
- [ ] Verify Jitsi Meet room embeds correctly with microphone and camera access.
- [ ] **Student**: Go to `/student/classes` and click **Join Class**.
- [ ] Verify student joins the same room with participant status.

### 5. Attendance Management
- [ ] **Faculty**: Open `/faculty/attendance`, select Batch and today's date.
- [ ] Mark students as Present, Late, or Absent. Click **Save Register**.
- [ ] **Student**: Open `/student/attendance` -> Verify attendance percentage and recent log match.

### 6. Public Website & Enquiry Flow
- [ ] Visit `https://oci.org.in` (or local port 3000).
- [ ] Verify Homepage, About, Courses, Faculty, and Success Stories render with dynamic content from Supabase.
- [ ] Navigate to `/contact` and submit an Enquiry form.
- [ ] Open `/admin/enquiries` -> Verify new enquiry is present in real-time.
- [ ] Update status to `CONTACTED` -> Confirm database update.

---

## 4. Disaster Recovery & Rollback Plan

1. **Vercel Frontend Rollback**:
   - In Vercel Project Dashboard -> Deployments -> Select previous successful deployment -> Click **Promote to Production**.
2. **Render Backend Rollback**:
   - In Render Dashboard -> Web Service -> Deploys -> Select prior commit -> Click **Rollback**.
3. **Database Rollback**:
   - Daily automated backups are stored in Supabase Cloud.
   - For point-in-time recovery, execute restore from the Supabase Project Settings -> Database Backups.
