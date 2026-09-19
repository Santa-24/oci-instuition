# Odisha Competitive Institute (OCI) — Master Platform Ecosystem

Unified platform repository for **Odisha Competitive Institute (OCI)**, established in 2017 in Nayabazar, Bhadrak, Odisha.

Organized into modular standalone services powered by a shared **Supabase PostgreSQL** cloud backend.

---

## 🏗️ Master System Architecture

```text
                                  OCI PLATFORM
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
  PUBLIC WEBSITE                 MASTER ADMIN                  RENDER BACKEND
     Next.js                        Next.js                     Node/Express
 (public-website/)                 (admin/)                      (backend/)
    Port: 3000                    Port: 3001                     Port: 8080
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                                       ▼
                                    SUPABASE
                                  (supabase/)
                      PostgreSQL 15+ • RLS • Auth • Storage
```

---

## 📁 Repository Structure

```text
oci-platform/
│
├── admin/            # Next.js 14 Master Admin Control Panel (Port 3001)
│   ├── app/          # Dashboard, Courses, Batches, Students, Teachers, CMS, Releases
│   ├── app/api/admin/# Server-side service-role CRUD endpoints bypassing RLS
│   └── lib/          # Typed academic services, Supabase admin client
│
├── public-website/   # Next.js Official Public Portal & APK Distribution (Port 3000)
│   ├── app/          # Academic Chronicle homepage, /exams, /download, /about, /contact
│   ├── app/api/      # /api/contact, /api/app/version/android
│   └── components/   # Editorial design system, Cookie banner, APK download terminal
│
├── backend/          # Node.js / Express Heavy Computation Service (Port 8080)
│   ├── src/          # CBT scoring engine, All India Rank generation, FCM push
│   ├── Dockerfile    # Production container spec
│   └── render.yaml   # Render deployment manifest
│
├── supabase/         # Centralized Supabase PostgreSQL Configuration
│   ├── complete_project_schema.sql  # Master platform database schema & seed
│   └── migrations/                  # Versioned schema migrations
│
├── docs/             # Master System Documentation & Architectural Specs
│   ├── admin-guide.md               # Master Admin Panel operational manual
│   ├── api.md                       # Complete API catalog & contracts
│   ├── architecture.md              # High-level topology & component matrix
│   ├── database.md                  # Supabase schema & RLS policy matrix
│   └── deployment.md                # Vercel & Render production deployment guide
│
└── scripts/          # End-to-end testing and verification scripts
```

> **Note on Mobile App (`app/`)**: The Flutter mobile application directory (`app/`) is excluded from web deployments (`.gitignore`) to keep cloud builds lightweight. Generated Android APKs are distributed through the Master Admin Panel at `/admin/app-releases`.

---

## 🚀 Quickstart Local Development

### 1. Master Admin Panel
```bash
cd admin
npm install
npm run dev
# Running at http://localhost:3001
```

### 2. Public Website
```bash
cd public-website
npm install
npm run dev
# Running at http://localhost:3000
```

### 3. Backend Engine
```bash
cd backend
npm install
npm start
# Running at http://localhost:8080
```

---

## 🌐 Production Deployment Guide

| Service | Hosting Platform | Root Directory in Git | Build Command | Output Directory |
|---|---|---|---|---|
| **Public Website** | **Vercel** | `public-website` | `next build` | `.next` |
| **Master Admin** | **Vercel** | `admin` | `next build` | `.next` |
| **Backend API** | **Render** | `backend` | `npm install` | Start: `npm start` |
| **Database** | **Supabase** | `https://utrusmludikyvxbmpicg.supabase.co` | Managed PostgreSQL | N/A |

For detailed step-by-step deployment instructions, refer to [`docs/deployment.md`](docs/deployment.md).
