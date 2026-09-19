# OCI Platform — Master API Architecture & Endpoint Catalog

## 1. Architectural Overview

The OCI platform utilizes a multi-tiered API architecture designed for security, serverless scalability, and real-time responsiveness:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OCI API Topology                                │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│ 1. Administrative API    │ 2. Public Web API    │ 3. Backend Engine    │
│    (admin: /api/admin/*) │    (public-website)  │    (backend: port    │
│                          │                      │     8080)            │
│  • Service Role Security │  • Contact Ingestion │  • CBT Exam Scoring  │
│  • Bypasses RLS          │  • Android Version   │  • AIR Calculation   │
│  • Full CRUD Engine      │  • Edge SSR Delivery │  • Push Dispatcher   │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 2. Master Admin Panel APIs (`admin/app/api/admin/*`)

All `/api/admin/*` endpoints run as Next.js Server Route Handlers using `supabaseAdmin` with the `SUPABASE_SERVICE_ROLE_KEY`.

### 2.1 Dashboard Metrics
- **Endpoint**: `GET /api/admin/dashboard`
- **Description**: Returns live database aggregates across all core tables.
- **Sample Response**:
  ```json
  {
    "success": true,
    "metrics": {
      "totalStudents": 48,
      "activeBatches": 3,
      "activeCourses": 4,
      "totalTeachers": 3,
      "pendingEnquiries": 2,
      "activeAnnouncements": 2,
      "totalExams": 1
    }
  }
  ```

### 2.2 Courses Management
- **Endpoints**:
  - `GET /api/admin/courses` — Retrieves all courses joined with active batch counts.
  - `POST /api/admin/courses` — Creates a new competitive course.
    ```json
    {
      "name": "OSSC CGL Comprehensive Coaching",
      "code": "OSSC-CGL-2026",
      "category": "State Recruitment",
      "durationMonths": 8,
      "description": "Prelims and mains coaching with daily test series."
    }
    ```
  - `PUT /api/admin/courses` — Updates course parameters.
  - `DELETE /api/admin/courses?id=<uuid>` — Deletes a course.

### 2.3 Batches & Timetable Rosters
- **Endpoints**:
  - `GET /api/admin/batches` — Lists batches joined with course details.
  - `POST /api/admin/batches` — Creates a new batch cohort.
    ```json
    {
      "name": "OSSC Target Morning Batch",
      "courseId": "148f5f04-...",
      "schedule": "Mon-Fri 08:00 AM - 11:30 AM",
      "roomName": "Hall A (Smart Classroom)",
      "capacity": 60
    }
    ```
  - `DELETE /api/admin/batches?id=<uuid>` — Deletes a batch cohort.

### 2.4 Student Directory & Enrollment
- **Endpoints**:
  - `GET /api/admin/students` — Lists all enrolled students with batch metadata.
  - `POST /api/admin/students` — Multi-table transaction: creates `profiles`, sets `'student'` in `user_roles`, and creates `students` entry.
    ```json
    {
      "name": "Priyanka Sahoo",
      "rollNo": "OCI-2026-108",
      "email": "priyanka.sahoo@gmail.com",
      "phone": "+91 94371 00000",
      "batchId": "b0000000-..."
    }
    ```
  - `DELETE /api/admin/students?id=<uuid>` — Deletes student enrollment and user profile.

### 2.5 Faculty Management
- **Endpoints**:
  - `GET /api/admin/teachers` — Lists all faculty members.
  - `POST /api/admin/teachers` — Inserts profile, sets `'teacher'` role, inserts into `teachers`, and syncs to `website_faculty`.
    ```json
    {
      "name": "Prof. Alok Mahapatra",
      "employeeId": "OCI-FAC-102",
      "email": "alok.mahapatra@oci.edu",
      "phone": "+91 98765 43210",
      "subject": "Quantitative Aptitude & Mathematics",
      "qualification": "M.Sc Mathematics, 10+ Yrs Mentorship"
    }
    ```
  - `DELETE /api/admin/teachers?id=<uuid>` — Deletes faculty record.

### 2.6 Announcements & Notices
- **Endpoints**:
  - `GET /api/admin/announcements` — Lists all published campus notices.
  - `POST /api/admin/announcements` — Broadcasts a new notice.
    ```json
    {
      "title": "Special Sunday Speed Math Marathon",
      "content": "All students report to Hall A at 8:00 AM.",
      "category": "Exams",
      "isUrgent": true
    }
    ```
  - `DELETE /api/admin/announcements?id=<uuid>` — Deletes notice.

### 2.7 Admission Leads & Inquiries
- **Endpoints**:
  - `GET /api/admin/enquiries` — Lists website and app admission leads.
  - `PATCH /api/admin/enquiries` — Updates lead status and counselor notes.
    ```json
    {
      "id": "e39e4ff5-...",
      "status": "CONTACTED",
      "internalNotes": "Counseling session booked for Saturday."
    }
    ```
  - `DELETE /api/admin/enquiries?id=<uuid>` — Deletes lead record.

### 2.8 Mobile Releases Management
- **Endpoints**:
  - `GET /api/admin/app-releases` — Lists all Android APK releases.
  - `POST /api/admin/app-releases` — Publishes a new release to `app_versions`.
  - `PATCH /api/admin/app-releases` — Toggles active state or mandatory update flag.
  - `DELETE /api/admin/app-releases?id=<uuid>` — Deletes a release.

---

## 3. Public Website APIs (`public-website/app/api/*`)

### 3.1 Contact & Lead Submission
- **Endpoint**: `POST /api/contact`
- **Authentication**: None (Public)
- **Description**: Ingests student admissions inquiries from the public website contact form into the Supabase `enquiries` table using the server-side `supabaseAdmin` client.
- **Request Body**:
  ```json
  {
    "fullName": "Siddharth Nayak",
    "phone": "9876543210",
    "email": "siddharth@gmail.com",
    "examInterested": "OSSC CGL 2026",
    "message": "Interested in morning batch fees and curriculum."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "enquiryId": "a1b2c3d4-..."
  }
  ```

### 3.2 Mobile App Version Check
- **Endpoint**: `GET /api/app/version/android`
- **Authentication**: None (Public)
- **Description**: Consumed by the Flutter mobile application (`app_update_service.dart`) on launch to verify whether an update is available.
- **Response**:
  ```json
  {
    "latestVersion": "1.0.0",
    "versionCode": 1,
    "minimumSupportedVersion": "1.0.0",
    "mandatory": false,
    "apkUrl": "https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk",
    "releaseNotes": [
      "Official production launch of the OCI mobile application",
      "Real-time integration with OCI examination CBT engine"
    ],
    "fileSize": 36700160,
    "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "releasedAt": "2026-09-19T13:24:00.000Z"
  }
  ```

---

## 4. Backend Engine API (`backend/`)

### 4.1 System Health
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "UP",
    "institute": "Odisha Competitive Institute (OCI)",
    "version": "1.0.0"
  }
  ```

### 4.2 Examination Grading
- **Endpoint**: `POST /api/exams/submit`
- **Description**: Scores multiple-choice responses, calculates negative marking deductions, accuracy percentage, and recalculates All India Rank (AIR).
