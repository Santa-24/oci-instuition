# OCI Platform — Database & PostgreSQL Architecture

## 1. Relational Database Overview

The OCI platform runs on Supabase PostgreSQL (15+) with Row Level Security (RLS) enabled on 100% of tables.

---

## 2. Table Schema Catalog

### 2.1 Identity & User Profiles
- `profiles`: Primary user identity referencing `auth.users(id)`. Columns: `id`, `email`, `full_name`, `phone`, `avatar_url`, `created_at`, `updated_at`.
- `user_roles`: Role assignments enforcing strict RBAC. Columns: `id`, `user_id`, `role` (`student`, `teacher`, `admin`, `superadmin`), `created_at`. Unique on `user_id`.

### 2.2 Academic Hierarchy
- `courses`: Academic tracks (JEE, NEET, OSSC, Banking, Railway). Columns: `id`, `name`, `code`, `category`, `duration_months`, `description`, `is_active`.
- `subjects`: Modules within courses. Columns: `id`, `course_id`, `name`, `code`.
- `batches`: Cohorts of students. Columns: `id`, `course_id`, `name`, `schedule`, `room_name`, `start_date`, `end_date`, `capacity`, `status`.
- `students`: Enrolled student profiles. Columns: `id` (references `profiles`), `roll_no`, `batch_id`, `admission_date`, `status`.
- `teachers`: Faculty member profiles. Columns: `id` (references `profiles`), `employee_id`, `subject`, `qualification`, `experience_years`, `bio`, `status`.

### 2.3 Interactive Classrooms & Attendance
- `live_classes`: Synchronous Jitsi video classrooms. Columns: `id`, `batch_id`, `teacher_id`, `subject`, `title`, `scheduled_start`, `scheduled_end`, `jitsi_room_name`, `status`.
- `attendance`: Biometric and classroom attendance logs. Columns: `id`, `student_id`, `live_class_id`, `status` (`present`, `absent`, `late`), `recorded_at`. Unique on `(student_id, live_class_id)`.

### 2.4 Study Materials & Assignments
- `study_materials`: Downloadable PDF lecture notes and DPPs. Columns: `id`, `batch_id`, `subject`, `title`, `type`, `file_url`, `file_size`, `download_count`.
- `recorded_classes`: Video lectures archive. Columns: `id`, `batch_id`, `subject`, `title`, `video_url`, `thumbnail_url`, `duration_seconds`.
- `assignments`: Homework problem sets. Columns: `id`, `batch_id`, `subject`, `title`, `description`, `due_date`, `status`.
- `assignment_submissions`: Student homework submissions. Columns: `id`, `assignment_id`, `student_id`, `submission_url`, `status`, `grade`, `feedback`.

### 2.5 Computer-Based Testing (CBT) & Ranking
- `questions`: Question bank pool. Columns: `id`, `subject`, `topic`, `question`, `options` (JSONB), `correct_option_index`, `explanation`, `difficulty`, `marks`, `negative_marks`.
- `exams`: CBT tests. Columns: `id`, `course_id`, `title`, `duration_minutes`, `total_marks`, `is_published`, `scheduled_date`.
- `exam_results`: Evaluated scorecards and rankings. Columns: `id`, `exam_id`, `student_id`, `score`, `total_marks`, `percentage`, `accuracy_percentage`, `air_rank`, `responses` (JSONB), `submitted_at`.

### 2.6 Website CMS & Communication
- `website_content`: Dynamic CMS key-value store (JSONB with GIN index).
- `website_faculty`: Public faculty bios and qualifications.
- `website_testimonials`: Verified student reviews.
- `website_success_stories`: Proven competitive selection records.
- `website_faqs`: Public admissions questions.
- `website_gallery`: Campus photos.
- `enquiries`: Prospective student admission leads.
- `notifications`: User notification inbox.
- `notification_tokens`: FCM registration tokens with device platform metadata.
- `announcements`: Institute notice board.
- `audit_logs`: Immutable security, exam, and administrative actions log.

---

## 3. Row Level Security (RLS) Policy Matrix

| Table | Public Access | Student Role | Teacher Role | Admin Role | Service Role |
|---|---|---|---|---|---|
| `website_content` | SELECT | SELECT | SELECT | ALL | ALL |
| `website_faculty` | SELECT (published) | SELECT | SELECT | ALL | ALL |
| `enquiries` | INSERT | None | None | ALL | ALL |
| `profiles` | None | SELECT/UPDATE (own) | SELECT (own) | ALL | ALL |
| `students` | None | SELECT (own) | SELECT (batch) | ALL | ALL |
| `live_classes` | None | SELECT (batch) | ALL (assigned) | ALL | ALL |
| `attendance` | None | SELECT (own) | ALL (batch) | ALL | ALL |
| `study_materials` | None | SELECT (enrolled) | ALL | ALL | ALL |
| `exams` | None | SELECT (published) | ALL | ALL | ALL |
| `exam_results` | None | SELECT/INSERT (own) | SELECT | ALL | ALL |
| `notifications` | None | SELECT/UPDATE (own) | SELECT/UPDATE (own)| ALL | ALL |
| `notification_tokens`| None | ALL (own token) | ALL (own token) | ALL | ALL |
| `audit_logs` | None | None | None | SELECT | ALL |

---

## 4. Stored Procedures (RPCs)

1. `get_public_website_bundle()`: Aggregates all published CMS sections into a single fast JSON payload.
2. `upsert_website_section(p_key, p_value)`: Atomically updates CMS sections with automatic timestamp tracking.
3. `calculate_exam_air_rankings(p_exam_id)`: Calculates DENSE_RANK based on score descending and accuracy percentage descending, updating `exam_results.air_rank`.
