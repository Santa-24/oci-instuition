# OCI Platform: Production Data Separation, Seed Data Cleanup & Role-Based Architecture Audit

**Document Version:** 2.0.0 (Production Release)  
**Date:** September 20, 2026  
**Audience:** Principal Software Architects, Database Architects, Security Engineers, Lead Mobile Engineers  
**Target Repository:** `oci-platform` (`public-website/`, `admin/`, `app/`, `backend/`, `supabase/`, `scripts/`)

---

## 1. Current Architecture

The OCI platform integrates four distinct application tiers around a unified, secure PostgreSQL / Supabase backend. The architectural principle governing this system is:

$$\text{Public Website CMS} \ne \text{Institute Operational System} \ne \text{Mobile Learning Data}$$

```
+-----------------------------------------------------------------------------------+
|                                 OCI PLATFORM                                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------------+                  +-----------------------------+   |
|   |      PUBLIC WEBSITE      |                  |          ADMIN WEB          |   |
|   |  - Marketing & About     |                  |  - Full Institutional Ops   |   |
|   |  - Public Faculty Bios   |                  |  - Course & Batch Lifecycle |   |
|   |  - Testimonials & Stories|                  |  - Student & Faculty Accounts|  |
|   |  - APK Download Link     |                  |  - CBT Exams & Question Bank|   |
|   |  - Admission Enquiries   |                  |  - Lead/Enquiry Management  |   |
|   +--------------------------+                  +-----------------------------+   |
|                 │                                              │                  |
|                 ▼ (Public Anon Read / Enquiry Post)            ▼ (Admin JWT)      |
|   +---------------------------------------------------------------------------+   |
|   |                        SUPABASE / POSTGRESQL LAYER                        |   |
|   |  Domain 1: CMS (website_content, website_faculty, testimonials, stories)  |   |
|   |  Domain 2: Academic (courses, subjects, batches, students, teachers...)    |   |
|   |  Domain 3: Communications (enquiries, announcements, notifications)       |   |
|   |  Domain 4: Distribution (app_versions, storage/app-releases)               |   |
|   +---------------------------------------------------------------------------+   |
|                 ▲ (Faculty Authenticated JWT)                  ▲ (Student JWT)    |
|                 │                                              │                  |
|   +--------------------------+                  +-----------------------------+   |
|   |      FACULTY PORTAL      |                  |     STUDENT MOBILE APP      |   |
|   |  - Assigned Classes      |                  |  - Enrolled Batches         |   |
|   |  - Live Session Hosting  |                  |  - Live Class Participation |   |
|   |  - Study Material Upload |                  |  - Study Notes & Downloads  |   |
|   |  - Question Authoring    |                  |  - CBT Exam Taking          |   |
|   |  - Attendance Marking    |                  |  - Genuine Personal Scorecards| |
|   +--------------------------+                  +-----------------------------+   |
+-----------------------------------------------------------------------------------+
```

Each consumer is strictly constrained to its designated data domain. Crucially, the presence of a public table in Supabase is never treated as permission for mobile learning features or operational dashboards to consume it.

---

## 2. Website CMS Domain

The **Website CMS Domain** encompasses tables and assets created solely to drive the marketing, public branding, and visitor conversion funnel of the public website (`public-website`):

### Tables & Schema
1. **`website_content`**: Key-value JSONB repository storing structured page sections:
   - `homepage`: Hero headline, mission statements, value propositions, feature pills.
   - `about`: Institutional history, founder's message, vision/mission statements.
   - `why_oci`: Pedagogical methodology, structured study routines, mentorship pillars.
   - `director`: Leadership profile, message from Dr. S. K. Nayak.
2. **`website_faculty`**: Public marketing profiles of prominent mentors:
   - Schema: `id UUID`, `name TEXT`, `subject TEXT`, `qualification TEXT`, `experience_years TEXT`, `photo_url TEXT`, `biography TEXT`, `display_order INT`, `is_published BOOL`.
   - **Boundary Rule**: `website_faculty` contains promotional bios for website visitors. It is **not** an authentication table and **not** linked to operational teaching accounts.
3. **`website_testimonials`**: Verified student reviews and exam clearances (e.g. OSSC CGL, Railway NTPC).
4. **`website_success_stories`**: In-depth ranker spotlights and achievement narratives.
5. **`website_faqs`**: Frequently asked questions on admissions, test series, and offline centers.
6. **`website_gallery`**: Campus infrastructure, classroom photos, and event archives.

### Consumption Rules
- **Public Website (`public-website`)**: Read-only via anon key.
- **Admin Web (`admin/app/admin/website/*`)**: Exclusive editorial management.
- **Faculty Portal & Student Mobile App**: **Zero access**. Neither the Flutter app nor faculty operations query or bind to any `website_*` table.

---

## 3. Operational Academic Domain

The **Operational Academic Domain** represents the institute's educational delivery engine:

### Tables & Entities
1. **`courses`**: Approved academic programs offered by the institute (e.g., *Odisha Civil Services Foundation*, *SSC CGL Target Batch*).
2. **`subjects`**: Curriculum components tied to specific courses (`course_id REFERENCES courses(id)`).
3. **`batches`**: Real classroom cohort allocations (`course_id`, `schedule`, `room_name`, `capacity`, `status`).
4. **`batch_students`**: Enrolled students assigned to specific batch cohorts.
5. **`students`**: Operational records containing official admission dates, roll numbers (`OCI-YYYY-XXXX`), and status.
6. **`teachers`**: Authenticated faculty records containing official employee IDs (`EMP-XXXX`), assigned subjects, and qualifications.
7. **`live_classes`**: Scheduled and live interactive video sessions powered by Jitsi Meet.
8. **`attendance`**: Daily and per-session attendance marks (`present`, `absent`, `late`, `excused`).
9. **`study_materials`**: Authenticated lecture notes, formula guides, and Daily Practice Problems (DPPs).
10. **`recorded_classes`**: Archived video recordings from past live sessions.
11. **`exams`**: Published Computer-Based Tests (CBT) with durations, negative marking rules, and dates.
12. **`questions`**: Authoritative question bank items with options, correct answer keys, and pedagogical explanations.
13. **`exam_results`**: Verifiable student scorecards, percentiles, accuracy metrics, and question-by-question responses.
14. **`assignments` & `assignment_submissions`**: Homework tasks, due dates, and student submission tracking.

### Operational Lifecycle
All records in this domain are created strictly through authentic administrative and faculty actions. **No mock or demo operational records are automatically seeded.** A fresh client deployment starts with zero courses, batches, exams, or student records.

---

## 4. Communication Domain

The **Communication Domain** manages interaction between the institute, prospective students, and enrolled learners:

1. **`enquiries`**:
   - **Source**: Public website contact and admission inquiry forms (`public-website/app/api/contact/route.ts`).
   - **Destination**: Admin operational lead dashboard (`admin/app/admin/enquiries/page.tsx`).
   - **Access**: Public visitors have `INSERT` permissions only. Students and faculty have no access. Admin has full `SELECT`, `UPDATE`, and `DELETE` access.
2. **`announcements`**:
   - Institutional campus notices and urgent bulletins created by Admin/Faculty.
   - Displayed on the public website's news ticker and the student mobile dashboard.
3. **`notifications` & `notification_tokens`**:
   - Targeted system alerts sent to specific student/faculty devices (`user_id = auth.uid()`).
4. **`audit_logs`**:
   - Immutable security and administrative activity log recording administrative mutations.

---

## 5. App Distribution Domain

The **App Distribution Domain** governs version control and APK binary delivery:

1. **`app_versions` Table**:
   - Stores published releases with `platform`, `version_name`, `version_code`, `apk_url`, `release_notes`, `checksum_sha256`, `file_size_bytes`, `minimum_supported_version`, and `is_active`.
2. **Storage Bucket `app-releases`**:
   - Public Supabase storage bucket hosting genuine, signed Android APK binaries (`/android/OCI-v1.0.0.apk`).
3. **Consumer Mapping**:
   - **Public Website (`public-website/app/download/page.tsx`)**: Fetches latest active release metadata and provides direct one-click APK downloads and QR code scanning.
   - **Student Mobile App (`app/lib/core/services/app_update_service.dart`)**: Checks installed build against `app_versions` on boot and prompts for in-app update if mandatory or newer version is available.
   - **Admin Web (`admin/app/admin/app-releases/page.tsx`)**: Publishes new APK releases, configures mandatory update gates, and audits release history.

---

## 6. Every Seed File Analyzed

A forensic audit of all SQL migration and seed files in `supabase/` was conducted:

| File Analyzed | File Path | Original Behavior | Audit Verdict & Resolution |
| :--- | :--- | :--- | :--- |
| `20260811000000_master_schema.sql` | `supabase/migrations/` | Created base schema and default `website_content` records. | Preserved. Legitimate DDL and default CMS text. |
| `20260918000000_deprecate_payments.sql` | `supabase/migrations/` | Dropped legacy payment tables and logged audit log. | Preserved. Clean deprecation migration. |
| `20260918120000_production_ready_migration.sql` | `supabase/migrations/` | Hardened RLS policies, created storage buckets, and set CMS keys. | Preserved. Security infrastructure. |
| `20260918130000_seed_master_data.sql` | `supabase/migrations/` | Seeded mixed data: 4 fake courses, 4 subjects, 3 batches, 1 exam, 3 questions, 2 announcements, AND website CMS faculty/testimonials. | **Modified**. Operational seeds (`courses`, `subjects`, `batches`, `exams`, `questions`, `announcements`) were completely removed. Kept only website CMS (`website_faculty`, `website_testimonials`, `website_success_stories`). |
| `20260918140000_app_versions_and_apk_distribution.sql` | `supabase/migrations/` | Created `app_versions` table and seeded initial v1.0.0 production APK metadata. | Preserved. Legitimate distribution infrastructure. |
| `20260920120000_auth_hardening_and_role_isolation.sql` | `supabase/migrations/` | Implemented `on_auth_user_created` trigger for automatic role and profile assignment. | Preserved. Core authentication/authorization engine. |
| `complete_project_schema.sql` | `supabase/` | Consolidated single-file schema containing Section 16 with mixed operational and CMS seeds. | **Modified**. Purged sections 16.1 (Courses), 16.2 (Subjects), 16.3 (Batches), 16.6 (Exams & Questions), and 16.7 (Announcements). Retained CMS and App Release. |
| `cms_master_migration.sql` | `supabase/` | Standalone CMS baseline with sample enquiries. | Isolated. Does not feed mobile application. |
| `20260920140000_production_data_separation_and_seed_cleanup.sql` | `supabase/migrations/` | **NEW Migration**. Purges all legacy operational seed UUIDs (`c0000000-...`, `d0000000-...`, `b0000000-...`, `e0000000-...`, `dc000000-...`, `a0000000-...`) and hardens operational RLS policies. | Applied and active. |

---

## 7. Website-Only Seed Records Preserved

The following client-approved marketing records were verified and preserved in `website_*` tables:

### 1. `website_faculty` (Public Mentors):
- `f0000000-0000-0000-0000-000000000001`: **Er. R. K. Mohapatra** (Quantitative Aptitude, B.Tech NIT Rourkela, 10+ Years experience)
- `f0000000-0000-0000-0000-000000000002`: **Prof. Arvind Verma** (Reasoning & Mental Ability, M.Sc Mathematics, 12+ Years experience)
- `f0000000-0000-0000-0000-000000000003`: **Dr. S. K. Nayak** (General Studies & Odisha Heritage, Ph.D History & Public Admin, 15+ Years experience)

### 2. `website_testimonials` (Public Student Reviews):
- `da000000-0000-0000-0000-000000000001`: **Priyanka Das** (OSSC CGL 2024, 5 Stars)
- `da000000-0000-0000-0000-000000000002`: **Bikash Mohanty** (Railway NTPC, 5 Stars)

### 3. `website_success_stories` (Public Rankers):
- `db000000-0000-0000-0000-000000000001`: **Subhashree Priyadarshini** (OSSC Inspector of Supplies, State Rank 4)
- `db000000-0000-0000-0000-000000000002`: **Manas Kumar Jena** (SSC CGL Auditor, All India Rank 142)

### 4. `website_content` (Public CMS Key-Value Store):
- `homepage`, `about`, `why_oci`, `exams`, `app_features`, `app_settings`.

---

## 8. Operational Seed Records Removed

The following fake operational records were purged from migrations and deleted from active database tables:

| Domain Table | Purged Seed Identifier / Record Name | Reason for Removal |
| :--- | :--- | :--- |
| `courses` | `c0000000-0000-0000-0000-000000000001` (*SSC CGL & CHSL Master Foundation*) | Operational entity; must be Admin-created. |
| `courses` | `c0000000-0000-0000-0000-000000000002` (*Odisha State Govt Combined*) | Operational entity; must be Admin-created. |
| `courses` | `c0000000-0000-0000-0000-000000000003` (*Railway Recruitment Board NTPC*) | Operational entity; must be Admin-created. |
| `courses` | `c0000000-0000-0000-0000-000000000004` (*Banking & Financial Services*) | Operational entity; must be Admin-created. |
| `subjects` | `d0000000-0000-0000-0000-000000000001` through `...0004` (*Quantitative Aptitude, Reasoning, English, Odisha GK*) | Operational subjects; must be added under real courses by Admin. |
| `batches` | `b0000000-0000-0000-0000-000000000001` (*SSC Pinnacle Morning Super 40*) | Fictional batch; students must be enrolled in real cohorts. |
| `batches` | `b0000000-0000-0000-0000-000000000002` (*Odisha State Target Batch B*) | Fictional batch; students must be enrolled in real cohorts. |
| `batches` | `b0000000-0000-0000-0000-000000000003` (*Railway Express Weekend Batch*) | Fictional batch; students must be enrolled in real cohorts. |
| `exams` | `e0000000-0000-0000-0000-000000000001` (*All India SSC CGL Tier-1 Mock #01*) | Fake exam; exams must be authored and published by Faculty/Admin. |
| `questions` | `dc000000-0000-0000-0000-000000000001` through `...0003` (Sample MCQs) | Sample question bank; questions must be curated in real question bank. |
| `announcements` | `a0000000-0000-0000-0000-000000000001` (*OSSC CGL 2026 Batch Admissions Open*) | Fake announcement; operational notices must be published by Admin. |
| `announcements` | `a0000000-0000-0000-0000-000000000002` (*Weekly Mock Test Schedule*) | Fake announcement; operational notices must be published by Admin. |

---

## 9. Mobile Data-Source Audit

A comprehensive code-level audit was conducted across the Flutter mobile application (`app/lib/`):

1. **CMS Table Isolation:**
   - A global scan for `website_content`, `website_faculty`, `website_testimonials`, `website_success_stories`, `website_faqs`, and `website_gallery` confirmed **0 occurrences in the mobile application**.
   - `DbTables` in `app/lib/core/network/supabase_service.dart` defines only operational tables: `profiles`, `courses`, `subjects`, `batches`, `liveClasses`, `studyMaterials`, `recordedClasses`, `assignments`, `assignmentSubmissions`, `questions`, `exams`, `examResults`, `attendance`, `announcements`, `notifications`, `auditLogs`.
2. **Zero-Record Behavior:**
   - Tested student login against an account with zero enrolled batches.
   - All screens render dedicated `AppEmptyState` widgets:
     - Dashboard: Onboarding welcome card with batch allocation advisory.
     - Classes: "No Classroom Batches Assigned" with counselor contact guidance.
     - Learn: "Curriculum Modules Pending" notice.
     - Tests: "No Exams Scheduled" notice.
     - Profile: Real verified roll number and 0.0% attendance computed without crash.
3. **No Cross-Domain Fallbacks:**
   - Confirmed no logic falls back to public CMS data if operational academic queries return empty results.

---

## 10. Admin Data-Source Audit

The Next.js Admin portal (`admin/`) was audited to verify operational control:

1. **CMS vs. Operational Route Separation:**
   - **Operational Management**: Located under `admin/app/admin/` (`courses/`, `subjects/`, `batches/`, `students/`, `teachers/`, `live-classes/`, `materials/`, `recorded-classes/`, `assignments/`, `mock-exams/`, `question-bank/`, `results/`, `announcements/`, `enquiries/`, `app-releases/`).
   - **Website CMS Management**: Exclusively isolated in `admin/app/admin/website/` (`about/`, `director/`, `faculty/`, `faqs/`, `gallery/`, `homepage/`, `seo/`, `success-stories/`, `testimonials/`).
2. **Dashboard Query Hardening:**
   - `admin/app/admin/dashboard/page.tsx`: Queries actual counts for `students`, `teachers`, `batches`, `courses`, and `enquiries`. Starts cleanly with zero when database is empty.
3. **Mock Data Elimination:**
   - Emptied `admin/lib/mock-data.ts`. All placeholder arrays (`mockStudents`, `mockTeachers`, etc.) are now empty exports, eliminating dead mock data.

---

## 11. Faculty Data-Source Audit

1. **Operational Faculty Accounts (`teachers`) Decoupled from CMS (`website_faculty`):**
   - **Vulnerability Discovered:** `admin/app/api/admin/teachers/route.ts` previously had logic that automatically synced new teachers into `website_faculty` on `POST` and deleted them from `website_faculty` on `DELETE`.
   - **Resolution Implemented:** Removed automatic sync and cascading deletion. Operational accounts (`teachers`) and public marketing profiles (`website_faculty`) are now completely decoupled.
   - **Verification:** Ran `scripts/verify_faculty_cms_independence.mjs`. Creating and deleting an operational teacher in `teachers` produced **zero changes** in `website_faculty`.
2. **Faculty Dashboard Hardening:**
   - In `admin/app/faculty/dashboard/page.tsx`, removed hardcoded strings:
     - Replaced `Hello, Prof. Verma` with dynamic greeting fetched from the user's `profiles.full_name`.
     - Replaced `SSC Pinnacle Morning Super 40` with dynamic session count from `live_classes`.
     - Replaced static `studentCount = 40` with real count from `students`.
     - Replaced static `materialsCount || 12` with genuine count from `study_materials`.
   - Displays a clean empty state (`No classes currently scheduled`) when no live sessions exist.

---

## 12. RLS & Access Boundary Findings

Row-Level Security (RLS) policies were audited and hardened in migration `20260920140000_production_data_separation_and_seed_cleanup.sql`:

1. **Broad `USING (true)` Policies Purged on Operational Tables:**
   - **`teachers`**: Replaced broad public read with `FOR SELECT TO authenticated USING (true)` and admin full CRUD. Public website cannot read operational `teachers` table; it reads `website_faculty`.
   - **`live_classes`**: Replaced broad read with:
     ```sql
     USING (
         batch_id IN (SELECT batch_id FROM public.batch_students WHERE student_id = auth.uid())
         OR batch_id IS NULL
         OR public.is_admin()
         OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
     );
     ```
   - **`study_materials`**: Restricted to batch-enrolled students, assigned teachers, and admin.
   - **`recorded_classes`**: Restricted to batch-enrolled students, assigned teachers, and admin.
   - **`assignments`**: Restricted to batch-enrolled students, assigned teachers, and admin.
   - **`exams`**: Restricted to `is_published = true` for students, with full access for teachers and admin.
   - **`enquiries`**: `INSERT` open to public visitors (`anon, authenticated`), while `SELECT/UPDATE/DELETE` locked exclusively to `public.is_admin()`.

---

## 13. Cross-Domain Dependencies Removed

| File Location | Legacy Dependency | Impact | Remediation Applied |
| :--- | :--- | :--- | :--- |
| `admin/app/api/admin/teachers/route.ts` | Auto-upserted and deleted from `website_faculty` | Creation of internal staff accounts contaminated public website marketing profiles | Decoupled completely; teacher routes manage only `teachers`, `profiles`, and `user_roles`. |
| `admin/app/faculty/dashboard/page.tsx` | Hardcoded `Hello, Prof. Verma` and `SSC Pinnacle` | Faculty dashboard presented fake batch schedules | Rebuilt with dynamic queries against `live_classes` and `study_materials`. |
| `admin/app/student/dashboard/page.tsx` | Hardcoded `Welcome back, Aarav!` and fake scores | Web student view showed hardcoded JEE scores | Rebuilt to query real database state with clean zero-record states. |
| `backend/server.mjs` | Auto-seeded `usr_std_01` (Aarav) and `usr_fac_01` (Verma) | Local server auto-populated demo operational records | Purged seed block; backend database starts completely empty. |
| `admin/lib/mock-data.ts` | Static arrays of students, batches, and exams | Lingering dead mock data | Emptied arrays to eliminate static demo contamination. |

---

## 14. Fresh-Database Behavior

When initialized from scratch with migrations:

1. **Public Website (`public-website`)**:
   - Displays genuine client-approved marketing content from `website_content`, `website_faculty`, `website_testimonials`, and `website_success_stories`.
   - Displays latest Android APK download link from `app_versions`.
   - Renders 0 active courses in course catalog until Admin creates courses.
   - Accepts admission enquiries and stores them in `enquiries`.
2. **Admin Web (`admin`)**:
   - Operational dashboard displays `0 Courses`, `0 Batches`, `0 Students`, `0 Teachers`, `0 Live Classes`.
   - Administrators can immediately create courses, subjects, batches, and provision faculty.
3. **Faculty Portal (`admin/app/faculty`)**:
   - Displays empty schedule state until classes are assigned or scheduled.
   - Enables live class scheduling and material uploads.
4. **Student Mobile App (`app`)**:
   - Fresh student accounts log in securely via Supabase Auth credentials.
   - Displays polished `AppEmptyState` widgets across Home, Classes, Learn, Tests, and Profile.
   - No mock courses, fake teachers, or synthetic scores are rendered.

---

## 15. End-to-End Validation

### Automated Verification Results

#### 1. Database Operational Seed Purge (`scripts/apply_data_separation.mjs`):
```text
=== EXECUTING OPERATIONAL SEED PURGE & DATA DOMAIN SEPARATION ===
✓ Purged demo questions
✓ Purged demo exams
✓ Purged demo batches
✓ Purged demo subjects
✓ Purged demo courses
✓ Purged demo announcements
✓ Public Website Faculty CMS preserved: 3 profile(s)
✓ Public Website Testimonials preserved: 2 testimonial(s)
✓ Public Website Success Stories preserved: 2 story/stories
✓ App Release Distribution preserved: 1 release(s)
✓ Operational Courses count: 0 (Expected: 0 on fresh production)
✓ Operational Batches count: 0 (Expected: 0 on fresh production)
✓ Operational Exams count: 0 (Expected: 0 on fresh production)
✓ Operational Announcements count: 0 (Expected: 0 on fresh production)
=== DATA SEPARATION & OPERATIONAL PURGE COMPLETE! ===
```

#### 2. Faculty Operational vs. CMS Independence Suite (`scripts/verify_faculty_cms_independence.mjs`):
```text
=== TESTING OPERATIONAL TEACHERS VS WEBSITE FACULTY CMS INDEPENDENCE ===
[1] Initial website_faculty profiles count: 3
[2] Provisioning operational teacher account: operational.faculty.1789879290608@oci.edu.in
  ✓ Operational teacher record created in 'teachers' table
[3] Post-creation website_faculty profiles count: 3
  ✓ website_faculty was NOT mutated by operational teacher account creation (Independent!)
[4] Cleaning up operational test teacher...
  ✓ website_faculty count remains strictly unchanged at 3
=== ALL FACULTY CMS INDEPENDENCE CHECKS PASSED! ===
```

#### 3. Authentication & Role Isolation Suite (`scripts/verify_auth_roles.mjs`):
```text
=== STARTING AUTHENTICATION & ROLE ISOLATION TEST ===
[1] Testing Student Provisioning & Login: test.student.1789879302569@gmail.com
  ✓ Student created successfully. User ID: 120cae42-5f71-4b9a-9672-65d58896561d
  ✓ Student successfully authenticated via credentials.
  ✓ Database profile created: 'Test Verification Student'
  ✓ User role assigned: 'student'
  ✓ Admin portal login check: Rejected? YES (Secure)
  ✓ Faculty portal login check: Rejected? YES (Secure)

[2] Testing Admin Provisioning Faculty: test.teacher.1789879302569@gmail.com
  ✓ Admin successfully provisioned faculty. User ID: 20c0a979-7adc-4be5-a84e-f2fcdbfe8e16
  ✓ Faculty role confirmed: 'teacher'
  ✓ Student portal rejection check: Rejected? YES (Secure)
  ✓ Admin portal rejection check: Rejected? YES (Secure)

=== ALL AUTHENTICATION & ROLE ISOLATION TESTS PASSED! ===
```

#### 4. Cross-App End-to-End Suite (`scripts/verify_e2e_full.mjs`):
```text
=== STARTING END-TO-END SUPABASE & CROSS-APP VERIFICATION ===
[1] Testing Public Anon Data Reads:
  ✓ Read 0 active courses for public website.
  ✓ Read 1 active Android release(s). Latest: v1.0.0
  ✓ Read 0 active announcements for public website.

[2] Testing Administrative CRUD Operations:
  ✓ Created course: "E2E Verification Course - Odisha Police SI"
  ✓ Public website instantly sees newly created course
  ✓ Created admission enquiry for "Ananya Pattnaik"
  ✓ Admin updated enquiry status: CONTACTED
  ✓ Created flash announcement: "E2E Flash Notice: Special Sunday Marathon Class"
  ✓ Public homepage instantly detects active announcement

[3] Cleaning up test records to maintain pristine database:
  ✓ Deleted test course, test enquiry, and test announcement.
=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY! ===
```

#### 5. Admin Next.js TypeScript Compilation:
```bash
npx tsc --noEmit
# Exit code: 0 (Zero TypeScript errors)
```

#### 6. Flutter Static Analysis & Bundle Build:
```bash
flutter analyze --no-pub
# 0 errors, 0 warnings

flutter build bundle
# Exit code: 0 (SUCCESS)
```

---

## 16. Remaining Issues & Next Steps

1. **Course Publishing Toggle for Public Website:**
   - Currently, all rows in `courses` where `is_active = true` are readable by the public website catalog. An optional boolean flag `show_on_website` can be added if the administration wishes to create internal-only test courses that do not appear on the public website.
2. **Automated Backup for Website CMS:**
   - Implement scheduled JSON exports of `website_content` and `website_faculty` to ensure editorial revisions by marketing staff are version-controlled alongside repository releases.
3. **Faculty Self-Service Profile Synchronization:**
   - In the future, if an operational teacher desires to showcase their bio on the public website, a deliberate "Request Public Showcase" administrative approval workflow can be implemented rather than an automatic unapproved sync.
