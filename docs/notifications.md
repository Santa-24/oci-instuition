# OCI Platform — Notifications & Firebase Cloud Messaging (FCM)

## 1. Notification Architecture

The OCI platform implements a fault-tolerant dual-channel notification pipeline:
1. **Primary Persistence**: All notifications are permanently recorded in the Supabase PostgreSQL `notifications` table.
2. **Push Delivery**: Trusted server backend (Render) dispatches push payloads via **Firebase Cloud Messaging (FCM)** to client devices.

```
       Admin / Faculty Action
                 │
                 ▼
     Render Backend API Service
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
Insert Record into    Fetch Active Tokens from
`public.notifications` `public.notification_tokens`
      │                     │
      ▼                     ▼
Supabase Realtime      Firebase Cloud Messaging
(Web Socket Broadcast) (FCM HTTP v1 / Admin SDK)
      │                     │
      ▼                     ▼
Active Web Browser     Student Mobile App / Browser Web Push
```

---

## 2. Notification Database Schema

### 2.1 `notifications` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, nullable for broadcast notices)
- `title` (TEXT, e.g. "Mock Test #01 Scorecard Published")
- `body` (TEXT, notification summary)
- `type` (TEXT, `TEST`, `NOTICE`, `MATERIAL`, `ATTENDANCE`, `CLASS`)
- `data` (JSONB, custom route parameters, e.g. `{"examId": "e1"}`)
- `read` (BOOLEAN, default `false`)
- `created_at` (TIMESTAMPTZ, default `NOW()`)

### 2.2 `notification_tokens` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, references `profiles`)
- `token` (TEXT, unique FCM device registration token)
- `platform` (TEXT, `web`, `android`, `ios`)
- `browser_device` (TEXT, user agent / device model)
- `active` (BOOLEAN, default `true`)
- `last_seen` (TIMESTAMPTZ, default `NOW()`)
- `created_at` (TIMESTAMPTZ, default `NOW()`)

---

## 3. Supported Notification Scenarios

| Trigger Event | Target Audience | Type | Action on Open |
|---|---|---|---|
| New Institute Notice Published | All Students & Faculty | `NOTICE` | Opens notice board |
| CBT Mock Test Published | Batch Students | `TEST` | Opens `/student/exams` |
| Exam Results & AIR Published | Enrolled Candidates | `RESULT` | Opens scorecard and ranking |
| New Study Notes Uploaded | Batch Students | `MATERIAL` | Opens `/student/materials` |
| Live Lecture Commencing | Batch Students | `CLASS` | Launches live Jitsi video room |
| Low Attendance Warning | Enrolled Student | `ATTENDANCE` | Opens attendance ledger |

---

## 4. Fault Tolerance & Fallback Design

1. **Unconfigured / Local Mode**: If `FIREBASE_PROJECT_ID` or service account private keys are not supplied in development, the backend records the notification in PostgreSQL and marks the push delivery as `local_dispatched`.
2. **Offline Delivery**: Even if push delivery fails or device is offline, users see all unread alerts in the in-app notification bell upon next login.
3. **Invalid Token Handling**: If FCM returns `UNREGISTERED` or `INVALID_ARGUMENT`, the backend automatically marks the corresponding device token as `active = false` in `notification_tokens`.
