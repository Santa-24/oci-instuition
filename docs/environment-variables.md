# OCI Platform — Deployment Environment Variables Matrix

## 1. Master Environment Variable Matrix

This matrix governs all environment variables across the OCI platform ecosystem.

| Variable Name | Frontend (Vercel) | Backend API (Render) | Supabase | Secret? | Description & Scope |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **YES** | NO | NO | **NO** | Canonical HTTPS URL of the Supabase project. Safe for browser bundles. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **YES** | NO | NO | **NO** | Anonymous client API key. Governed by PostgreSQL Row Level Security (RLS). |
| `SUPABASE_URL` | NO | **YES** | NO | **NO** | Server-side Supabase project endpoint. |
| `SUPABASE_SECRET_KEY` | NO | **YES** | YES | **YES** | **CRITICAL SECRET**: Supabase Service Role key. Bypasses RLS. Never expose to client bundles. |
| `NEXT_PUBLIC_API_URL` | **YES** | NO | NO | **NO** | Public HTTPS endpoint for the Render backend API (`https://api.oci-domain.com`). |
| `SERVER_PORT` / `PORT` | NO | **YES** | NO | **NO** | Listen port for backend service (default: `8080`). |
| `FRONTEND_URL` | NO | **YES** | NO | **NO** | Primary production frontend domain (`https://www.oci-domain.com`). |
| `CORS_ALLOWED_ORIGINS` | NO | **YES** | NO | **NO** | Comma-separated list of origins permitted to call authenticated backend endpoints. |
| `REDIS_URL` | NO | **YES** | NO | **YES** | **SECRET**: Upstash Redis REST/TCP connection URL. |
| `REDIS_TOKEN` | NO | **YES** | NO | **YES** | **SECRET**: Upstash Redis REST bearer token. |
| `FIREBASE_PROJECT_ID` | **OPTIONAL** | **YES** | NO | **NO** | Google Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | NO | **YES** | NO | **YES** | **SECRET**: Firebase service account client email. |
| `FIREBASE_PRIVATE_KEY` | NO | **YES** | NO | **YES** | **CRITICAL SECRET**: Firebase service account RSA private key. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | **YES** | NO | NO | **NO** | Public Firebase Web SDK API key. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`| **YES** | NO | NO | **NO** | Public key for Web Push notification registration. |
| `JITSI_SERVER_URL` | **YES** | **YES** | NO | **NO** | Jitsi Meet server host (`https://meet.jit.si`). |
| `NODE_ENV` | **YES** | **YES** | NO | **NO** | Environment mode (`production` or `development`). |
| `JWT_SECRET` | NO | **YES** | NO | **YES** | **SECRET**: Secret key used for signing session verification tokens. |

---

## 2. Security Rules for Environment Variables

1. **Client-Safe Prefix Rule**: Only variables prefixed with `NEXT_PUBLIC_` may appear in Vercel client-side bundles.
2. **Never Commit Secrets**: Never commit `.env`, `.env.local`, `.env.production`, or service-account JSON files to version control.
3. **Template Integrity**: Maintain `.env.example` templates with sanitized placeholder values (`KEY_NAME=your_value_here`).
4. **Leak Prevention**: Render and Vercel build output logs must be scrubbed of any secret values.
