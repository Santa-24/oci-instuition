# OCI Master Admin Panel — Next.js

Operational command center for the **Odisha Competitive Institute (OCI)**. This is a standalone **Next.js 14+** application with Tailwind CSS, Lucide icons, Supabase Auth/PostgreSQL integration, and complete management coverage across 10 operational domains.

---

## 🏗️ Architecture

```text
                  OCI SYSTEM
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
PUBLIC WEBSITE    MOBILE APP     MASTER ADMIN
   Next.js          Flutter         Next.js
   (Web UI)      (Student/Teach)  (admin/ app)
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
                 SUPABASE
          PostgreSQL + Auth
          Storage + RLS
          Edge Functions
```

---

## 📁 Information Architecture & Routes

| Module | Route | Purpose |
|---|---|---|
| **Command Center** | `/admin/dashboard` | Real-time KPIs (students, live classes, attendance, exams) |
| **Website CMS (13 Views)** | `/admin/website/*` | Controls Homepage, About, Vision (Eng/Odia), Director, Why OCI, Exams, App Showcase, Success Stories, Faculty, Testimonials, Gallery, FAQs, SEO |
| **Education** | `/admin/students`, `/admin/teachers`, `/admin/parents`, `/admin/courses`, `/admin/subjects`, `/admin/batches` | Academic curriculum, student/parent rosters, faculty assignments |
| **Live Learning** | `/admin/live-classes`, `/admin/recorded-classes`, `/admin/materials`, `/admin/attendance` | Jitsi live session scheduling, lecture archives, PDF notes, attendance audits |
| **Assignments** | `/admin/assignments` | Homework distribution and submission grading |
| **Examination** | `/admin/question-bank`, `/admin/practice-tests`, `/admin/mock-exams`, `/admin/results` | MCQ pool, timed CBT mock exam publishing, scorecards & AIR rankings |
| **Communication** | `/admin/notifications`, `/admin/announcements`, `/admin/enquiries` | Push notification broadcaster (FCM), notice board, website admission lead pipeline |
| **Media Library** | `/admin/media` | Cloud storage browser for photos, logos, and brochures |
| **Analytics** | `/admin/analytics` | Exam progression charts, batch attendance distributions, selection statistics |
| **Settings** | `/admin/settings/*` | Contact details, Social media links, Administrators, Roles (RBAC), Immutable Audit logs |

---

## ⚡ Quick Start

```bash
# Navigate to the admin panel directory
cd admin

# Install dependencies
npm install

# Run the local development server (runs on http://localhost:3001)
npm run dev

# Build for production
npm run build
```

---

## 🔐 Environment Variables

Create `admin/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_NAME="OCI Master Admin"
NEXT_PUBLIC_APP_ENV=development
```

---

## 🗄️ Database Schema & Migrations

The full PostgreSQL DDL with table schemas, indexes, and Row Level Security (RLS) policies is located in:
`admin/lib/supabase/schema.sql`
