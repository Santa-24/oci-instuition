# OCI Platform — Authentication & Role-Based Access Control (RBAC)

## 1. Authentication Architecture

The OCI platform utilizes **Supabase Auth** as its core authentication provider, backed by a custom `user_roles` relation in PostgreSQL.

```
User enters credentials (email/password or OTP)
                       │
                       ▼
         supabase.auth.signInWithPassword()
                       │
                       ▼
             JWT Issued with auth.uid()
                       │
                       ▼
       Query public.user_roles (user_id = auth.uid())
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
     ADMIN          TEACHER         STUDENT
       │               │               │
       ▼               ▼               ▼
/admin/dashboard   /faculty/dashboard  /student/dashboard
```

---

## 2. Role Taxonomy & Permissions

| Role Identifier | Description | Allowed Route Prefix | Permitted Operations |
|---|---|---|---|
| `admin` | Institute Director & Academic Administrators | `/admin/*` | Full read/write access to courses, batches, faculty, students, question bank, financial records, audit logs, and website CMS. |
| `teacher` | Subject Faculty & Academic Mentors | `/faculty/*` | Host live classrooms, author exam questions, mark live session attendance, upload study notes, and evaluate student assignments. |
| `student` | Enrolled Institute Candidates | `/student/*` | Access enrolled batch syllabus, join live video classes, download notes, take CBT mock tests, view scorecards/AIR, and review attendance records. |
| `parent` | Guardians of Enrolled Students | `/parent/*` | View linked student attendance compliance and CBT test progress reports. |

---

## 3. Server-Side Role Enforcement

Frontend route hiding is never trusted as a security barrier. Authorization is strictly enforced at two levels:

1. **PostgreSQL RLS Level**:
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin()
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN EXISTS (
           SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid() AND role = 'admin'
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```
2. **Backend API Level (Render)**:
   API endpoints on Render inspect the Bearer JWT token, extract the caller's UUID, and verify against `user_roles` before executing any privileged mutation.

---

## 4. Session Persistence & Refresh

- Client sessions are persisted securely in local browser storage via `@supabase/ssr` / `@supabase/supabase-js`.
- Access tokens automatically refresh prior to expiry via Supabase SDK background workers.
- On user sign-out (`supabase.auth.signOut()`), the local session is purged and the user is redirected to `/login`.
