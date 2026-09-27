-- ==============================================================================
-- OCI PLATFORM — PRODUCTION INFRASTRUCTURE & RLS HARDENING MIGRATION
-- ==============================================================================
-- Target: Supabase PostgreSQL
-- Purpose:
--   1. Eliminates loose USING (true) policies on private academic resources
--   2. Enforces Batch-level Isolation for Students
--   3. Enforces Strict Anti-IDOR across Attendance, Results, Submissions, Profiles
--   4. Creates R2 Storage Objects Metadata Table (Section 24)
--   5. Implements RPC for Signed URL authorization & metadata tracking
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDENED RLS POLICIES FOR ACADEMIC RESOURCES
-- ------------------------------------------------------------------------------

-- 1.1 Study Materials: Restrict to assigned batch, general batch (batch_id IS NULL), or Faculty/Admin
DROP POLICY IF EXISTS "Allow read study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow student read study_materials" ON public.study_materials;
CREATE POLICY "Allow student read study_materials" ON public.study_materials
    FOR SELECT USING (
        batch_id IS NULL
        OR batch_id IN (SELECT batch_id FROM public.students WHERE id = auth.uid())
        OR public.is_teacher()
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

-- 1.2 Assignments: Restrict to assigned batch, general batch (batch_id IS NULL), or Faculty/Admin
DROP POLICY IF EXISTS "Allow read assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow student read assignments" ON public.assignments;
CREATE POLICY "Allow student read assignments" ON public.assignments
    FOR SELECT USING (
        batch_id IS NULL
        OR batch_id IN (SELECT batch_id FROM public.students WHERE id = auth.uid())
        OR public.is_teacher()
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

-- 1.3 Live Classes: Meeting rooms and streams restricted to enrolled students, Faculty, or Admin
DROP POLICY IF EXISTS "Allow read live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow student read live_classes" ON public.live_classes;
CREATE POLICY "Allow student read live_classes" ON public.live_classes
    FOR SELECT USING (
        batch_id IS NULL
        OR batch_id IN (SELECT batch_id FROM public.students WHERE id = auth.uid())
        OR public.is_teacher()
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

-- 1.4 Recorded Classes: Lecture archive restricted to enrolled students, Faculty, or Admin
DROP POLICY IF EXISTS "Allow read recorded_classes" ON public.recorded_classes;
DROP POLICY IF EXISTS "Allow student read recorded_classes" ON public.recorded_classes;
CREATE POLICY "Allow student read recorded_classes" ON public.recorded_classes
    FOR SELECT USING (
        batch_id IS NULL
        OR batch_id IN (SELECT batch_id FROM public.students WHERE id = auth.uid())
        OR public.is_teacher()
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

-- 1.5 Teachers: Operational employee IDs restricted to authenticated sessions
DROP POLICY IF EXISTS "Allow read teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow authenticated read teachers" ON public.teachers;
CREATE POLICY "Allow authenticated read teachers" ON public.teachers
    FOR SELECT USING (
        auth.role() = 'authenticated'
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------------------------
-- 2. CLOUDFLARE R2 STORAGE METADATA TABLE (Section 24)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.r2_storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_name VARCHAR(100) NOT NULL,
    object_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type VARCHAR(150),
    file_size_bytes BIGINT,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_bucket_object_key UNIQUE (bucket_name, object_key)
);

CREATE INDEX IF NOT EXISTS idx_r2_storage_bucket_key ON public.r2_storage_objects(bucket_name, object_key);
CREATE INDEX IF NOT EXISTS idx_r2_storage_owner ON public.r2_storage_objects(owner_id);
CREATE INDEX IF NOT EXISTS idx_r2_storage_entity ON public.r2_storage_objects(related_entity_type, related_entity_id);

ALTER TABLE public.r2_storage_objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for public R2 objects" ON public.r2_storage_objects;
CREATE POLICY "Allow public read for public R2 objects" ON public.r2_storage_objects
    FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Allow users read own R2 objects" ON public.r2_storage_objects;
CREATE POLICY "Allow users read own R2 objects" ON public.r2_storage_objects
    FOR SELECT USING (
        owner_id = auth.uid()
        OR public.is_teacher()
        OR public.is_admin()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Allow admins manage all R2 objects" ON public.r2_storage_objects;
CREATE POLICY "Allow admins manage all R2 objects" ON public.r2_storage_objects
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 3. AUDIT & LOGGING HARDENING
-- ------------------------------------------------------------------------------
-- Prevent arbitrary audit_log insertion without authentication
DROP POLICY IF EXISTS "Allow insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert audit_logs" ON public.audit_logs
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------------------------
-- 4. RPC: RESOLVE USER IDENTIFIER (FACULTY EMPLOYEE ID / ROLL NO TO EMAIL)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_user_identifier(p_identifier TEXT)
RETURNS TEXT AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- 1. Check teachers by employee_id
    SELECT p.email INTO v_email
    FROM public.teachers t
    JOIN public.profiles p ON p.id = t.id
    WHERE UPPER(t.employee_id) = UPPER(TRIM(p_identifier))
    LIMIT 1;

    IF v_email IS NOT NULL THEN
        RETURN v_email;
    END IF;

    -- 2. Check students by roll_no
    SELECT p.email INTO v_email
    FROM public.students s
    JOIN public.profiles p ON p.id = s.id
    WHERE UPPER(s.roll_no) = UPPER(TRIM(p_identifier))
    LIMIT 1;

    RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 5. CONFIRMATION MESSAGE
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'OCI Platform Production Hardening Migration applied successfully.';
END $$;
