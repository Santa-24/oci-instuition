# OCI Platform — Production Deployment Guide

## 1. Production Architecture Deployment Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OCI Platform Services                           │
├───────────────────┬──────────────────────┬─────────────────────────────┤
│ Service           │ Hosting Platform     │ Repository Root Directory   │
├───────────────────┼──────────────────────┼─────────────────────────────┤
│ Public Website    │ Vercel               │ public-website              │
│ Master Admin      │ Vercel               │ admin                       │
│ Backend API       │ Render               │ backend                     │
│ Cloud Database    │ Supabase             │ supabase                    │
│ Mobile App (APK)  │ Android Architecture │ app (Excluded from Web Git) │
└───────────────────┴──────────────────────┴─────────────────────────────┘
```

---

## 2. Service-by-Service Deployment Instructions

### 2.1 Public Website (`public-website/`) — Vercel
1. **Connect Git Repository**: Import `Santa-24/oci-instuition` into Vercel.
2. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `public-website`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
   SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
   NEXT_PUBLIC_SITE_NAME="Odisha Competitive Institute"
   NEXT_PUBLIC_SITE_TAGLINE="Your Goal. Our Guidance. Your Success."
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SITE_PHONE="7205021878"
   NEXT_PUBLIC_SITE_WHATSAPP="7655004403"
   NODE_ENV=production
   ```

---

### 2.2 Master Admin Panel (`admin/`) — Vercel
1. **Connect Git Repository**: Create a second Vercel project from `Santa-24/oci-instuition`.
2. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `admin`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
   SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
   NODE_ENV=production
   ```

---

### 2.3 Backend API Engine (`backend/`) — Render
1. **Create Web Service on Render**:
   - Connect Git repository to Render.
   - **Root Directory**: `backend`
   - **Runtime**: `Node` (or Docker with `backend/Dockerfile`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
2. **Environment Variables in Render Dashboard**:
   ```env
   PORT=8080
   NODE_ENV=production
   SUPABASE_URL=https://utrusmludikyvxbmpicg.supabase.co
   SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1...
   FRONTEND_URL=https://your-public-website.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-public-website.vercel.app,https://your-admin.vercel.app
   ```
3. **Health Check Verification**:
   - Visit `https://your-backend.onrender.com/health` to confirm `{ "status": "UP" }`.

---

### 2.4 Cloud Database & Storage — Supabase
- **Canonical Instance**: `https://utrusmludikyvxbmpicg.supabase.co`
- **Master Schema**: Contained in `supabase/complete_project_schema.sql`.
- **Storage Buckets**:
  - `app-releases` (Public): Houses official Android APK binaries for the download portal and in-app updates.
  - `study-materials`: Course PDFs, handwritten notes, and syllabus archives.
  - `avatars`: Faculty and student profile photographs.

---

### 2.5 Android Mobile App (`app/`)
- The `app/` folder contains the native **Flutter (Dart)** application.
- It is excluded from web Git deployments (`.gitignore`) to keep the cloud deployment bundle lightweight and avoid building mobile toolchains on web platforms.
- Android APK binaries generated from `app/` are uploaded via the Master Admin Panel at `/admin/app-releases` to automatically distribute them to users.
