# Intuition Coaching Institute — Mobile App (Flutter)

Production-grade cross-platform mobile client for **Intuition Coaching Institute (Bhadrak, Odisha)**, delivering dedicated academic portals for **Students** and **Faculty**.

---

## 📱 Portals & Features

- **Student Portal**: Academic dashboard, live classroom sessions, timed NTA-pattern mock CBTs, chapter-wise curriculum, PDF study vault & DPPs, high-definition lecture recordings player, attendance tracker, and notifications.
- **Faculty Portal**: Live lecture broadcaster, timetable management, interactive student attendance roll-call marker (Present / Late / Absent), study material & DPP publisher, and mock CBT batch analytics & assignment grading.
- **Admin Boundary**: Institute administration is strictly hosted on the Web Admin Portal. Mobile clients automatically restrict administrative accounts and direct staff to the web dashboard.
- **No In-App Payments**: All payment and fee collection has been completely removed across the platform in favor of direct institutional enrollment.

---

## ⚡ Running Locally

```bash
cd app
flutter pub get
flutter run
```

---

## 🔐 Environment Configuration

Configure `app/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JITSI_SERVER_URL=https://meet.jit.si
FCM_SENDER_ID=123456789012
ENVIRONMENT=development
```
