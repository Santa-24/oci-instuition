# OCI Platform — Master Admin Panel Operational Guide

## 1. System Overview

The **OCI Master Admin Panel** (`admin/`) is an enterprise-grade administrative control center for Odisha Competitive Institute. Built with **Next.js 14 App Router** and backed directly by **Supabase PostgreSQL** (`https://utrusmludikyvxbmpicg.supabase.co`), it provides real-time oversight and administrative control over the entire educational platform.

All administrative actions execute server-side using the `SUPABASE_SERVICE_ROLE_KEY`, bypassing PostgreSQL Row Level Security (RLS) limitations while preserving data integrity and strict PostgreSQL UUID specifications.

```
┌─────────────────────────────────────────────────────────────┐
│                   Master Admin Panel                        │
│            (Next.js 14 App Router — Port 3001)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Server-Side Service Role API (/api/admin/*)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase PostgreSQL Database                │
│    Courses • Batches • Students • Teachers • Enquiries      │
│     Announcements • Releases • CMS Content • Exams          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│       Public Website        ││       Mobile App (APK)       │
│  (Next.js — Port 3000)      ││       (Flutter Native)       │
│  • Live Course Catalog      ││  • Live In-App Update Engine │
│  • Campus Flash Notices     ││  • CBT Examination Engine    │
│  • Dynamic Hero & About CMS ││  • Batch Notices & Classes   │
│  • Instant Contact Ingestion││  • Offline Notes & Syllabus  │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 2. Core Administrative Domains & Operations

### 2.1 Dashboard & Real-Time Metrics (`/admin/dashboard`)
- **Backend Route**: `GET /api/admin/dashboard`
- **Data Returned**: Live aggregates computed directly from Supabase tables:
  - Total Enrolled Students (`students` table)
  - Active Cohort Batches (`batches` table)
  - Active Courses & Disciplines (`courses` table)
  - Faculty Mentors (`teachers` table)
  - Pending Admission Leads (`enquiries` table)
  - Active Campus Circulars (`announcements` table)
  - Scheduled CBT Examinations (`exams` table)

---

### 2.2 Courses & Discipline Catalog (`/admin/courses`)
- **Backend Routes**:
  - `GET /api/admin/courses` — Retrieves all courses joined with active batch counts.
  - `POST /api/admin/courses` — Creates a new course with UUID generation.
  - `PUT /api/admin/courses` — Updates course duration, syllabus, or active state.
  - `DELETE /api/admin/courses?id=<uuid>` — Deletes a course.
- **Supported Categories**:
  - `Central Government` (SSC CGL, CHSL, MTS, GD)
  - `State Recruitment` (OSSC CGL, OSSSC Combined, Odisha Police SI)
  - `Railways` (RRB NTPC, Group D, ALP)
  - `Banking` (IBPS PO/Clerk, SBI PO/JA)
  - `Teaching` (CT, B.Ed Entrance, OTET, OSSTET)
  - `Defence` (Armed Forces, Paramilitary)
- **Public Impact**: Newly created or modified courses instantly appear in the public website's **"Core Examination Streams"** section on the homepage and under **Examinations Prospectus** (`/exams`).

---

### 2.3 Batches & Timetable Rosters (`/admin/batches`)
- **Backend Routes**:
  - `GET /api/admin/batches` — Returns batches joined with course details.
  - `POST /api/admin/batches` — Creates batches linked to course UUIDs.
  - `DELETE /api/admin/batches?id=<uuid>` — Deletes a batch cohort.
- **Roster Controls**:
  - Classroom allocation (e.g. `Hall A (Smart Classroom)`).
  - Timetable scheduling (e.g. `Mon-Fri 08:00 AM - 01:30 PM`).
  - Seat capacity and enrollment limit tracking.

---

### 2.4 Student Directory & Admissions (`/admin/students`)
- **Backend Routes**:
  - `GET /api/admin/students` — Lists enrolled aspirants with batch links.
  - `POST /api/admin/students` — Multi-table transaction creating user `profiles`, assigning `'student'` in `user_roles`, and inserting into `students`.
  - `DELETE /api/admin/students?id=<uuid>` — Deletes a student and associated role mappings.
- **Features**:
  - Dynamic batch assignment dropdown populated directly from live Supabase batches.
  - Search by name, roll number, or email.
  - Filter by batch cohort.

---

### 2.5 Faculty Management (`/admin/teachers`)
- **Backend Routes**:
  - `GET /api/admin/teachers` — Lists faculty members and assigned batches.
  - `POST /api/admin/teachers` — Inserts profile, assigns `'teacher'` role, inserts into `teachers`, and synchronizes public profile into `website_faculty`.
  - `DELETE /api/admin/teachers?id=<uuid>` — Deletes teacher record.
- **OCI Subject Specializations**:
  - Quantitative Aptitude & Mathematics
  - Logical Reasoning & Analytical Ability
  - General Studies & Indian Polity
  - Odisha GK, History & Geography
  - English Language & Comprehension
  - Current Affairs & Static GK
  - Computer Awareness & Banking Awareness

---

### 2.6 Announcements & Campus Circulars (`/admin/announcements`)
- **Backend Routes**:
  - `GET /api/admin/announcements` — Retrieves notices sorted by creation time.
  - `POST /api/admin/announcements` — Broadcasts a new notice.
  - `DELETE /api/admin/announcements?id=<uuid>` — Deletes an announcement.
- **Categories**: `Admissions`, `Exams`, `Holidays`, `General`.
- **Urgent Priority Flag**: When `is_urgent` is enabled, the notice is immediately displayed on the **Live Campus Emergency Banner** at the top of the public website homepage.

---

### 2.7 Admission Leads & CRM (`/admin/enquiries`)
- **Backend Routes**:
  - `GET /api/admin/enquiries` — Retrieves prospective student inquiries.
  - `PATCH /api/admin/enquiries` — Updates status (`NEW`, `CONTACTED`, `FOLLOW_UP`, `CONVERTED`, `CLOSED`) and internal counselor notes.
  - `DELETE /api/admin/enquiries?id=<uuid>` — Deletes processed inquiry.
- **Lead Sources**: Captured directly from the public website contact forms (`/contact`) and mobile app inquiries.

---

### 2.8 Mobile Application Releases (`/admin/app-releases`)
- **Backend Routes**:
  - `GET /api/admin/app-releases` — Lists all uploaded Android APK releases.
  - `POST /api/admin/app-releases` — Registers a new release in `app_versions`.
  - `PATCH /api/admin/app-releases` — Toggles active state or mandatory update flag.
  - `DELETE /api/admin/app-releases?id=<uuid>` — Deletes a release.
- **Automated Update Pipeline**:
  1. Admin uploads an APK binary or enters the public storage URL.
  2. Release is marked `is_active = true`.
  3. The public website download page (`/download`) immediately serves the new binary, version name, and release notes.
  4. The mobile update endpoint (`/api/app/version/android`) notifies installed Android apps to prompt students for update installation.

---

### 2.9 Dynamic Website CMS (`/admin/website/*`)
- **Backend Routes**:
  - `GET /api/admin/website?key=<key>` — Fetches CMS section JSON.
  - `POST /api/admin/website` — Upserts section JSON into `website_content`.
- **Supported CMS Sections**:
  - `homepage`: Hero headline, eyebrow tag, subheadings, trust metrics, CTA links.
  - `about`: Director's address, institutional heritage, core tenets.
  - `why-oci`: Pedagogical framework, 4-stage progression rail.
  - `testimonials`: Verified student reviews.
  - `success-stories`: Rank achievements and competitive selection results.
  - `faqs`: Common student admissions inquiries.

---

## 3. Environment Configuration

The admin panel requires the following environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
NODE_ENV=production
```

> **Security Rule**: `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_` and must **never** be imported into client components (`'use client'`).
