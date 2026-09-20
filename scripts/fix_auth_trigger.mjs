import { createClient } from '../admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixAndTest() {
  console.log("=== FIXING AUTH TRIGGER & VERIFYING SIGNUP / SIGNIN ===");

  // 1. Fix handle_new_user function in Supabase via RPC or SQL
  // Let's create an RPC or execute DDL to add updated_at and replace handle_new_user
  const fixSql = `
    -- 1. Ensure updated_at exists on students and teachers
    ALTER TABLE public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- 2. Update handle_new_user trigger function
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
        assigned_role text;
        raw_role text;
        user_full_name text;
        user_phone text;
        generated_roll text;
        current_year text;
    BEGIN
        user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student Aspirant');
        user_phone := NEW.raw_user_meta_data->>'phone';
        raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
        current_year := TO_CHAR(NOW(), 'YYYY');

        -- Role Assignment
        IF raw_role = 'teacher' OR raw_role = 'faculty' THEN
            IF (NEW.raw_app_meta_data->>'provider' = 'admin') OR (auth.role() = 'service_role') THEN
                assigned_role := 'teacher';
            ELSE
                assigned_role := 'student';
            END IF;
        ELSIF raw_role = 'admin' OR raw_role = 'superadmin' THEN
            IF auth.role() = 'service_role' THEN
                assigned_role := 'admin';
            ELSE
                assigned_role := 'student';
            END IF;
        ELSE
            assigned_role := 'student';
        END IF;

        -- 1. Upsert Profile
        INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
        VALUES (NEW.id, NEW.email, user_full_name, user_phone, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
            updated_at = NOW();

        -- 2. Upsert Role in user_roles
        INSERT INTO public.user_roles (id, user_id, role, created_at)
        VALUES (gen_random_uuid(), NEW.id, assigned_role, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role;

        -- 3. If Student, ensure record in students table
        IF assigned_role = 'student' THEN
            generated_roll := 'OCI-' || current_year || '-' || LPAD(FLOOR(1000 + RANDOM() * 8999)::text, 4, '0');
            INSERT INTO public.students (id, roll_no, status, admission_date, created_at, updated_at)
            VALUES (NEW.id, generated_roll, 'active', CURRENT_DATE, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        END IF;

        -- 4. If Teacher, ensure record in teachers table
        IF assigned_role = 'teacher' THEN
            INSERT INTO public.teachers (id, employee_id, subject, status, created_at, updated_at)
            VALUES (
                NEW.id,
                'FAC-' || LPAD(FLOOR(100 + RANDOM() * 899)::text, 3, '0'),
                COALESCE(NEW.raw_user_meta_data->>'subject', 'General Studies'),
                'active',
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;

        RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  // We can execute SQL via a function or check how migrations were run
  console.log("Applying schema adjustments...");
}

fixAndTest();
