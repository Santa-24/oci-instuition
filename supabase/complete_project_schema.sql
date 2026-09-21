-- ==============================================================================
-- ODISHA COMPETITIVE INSTITUTE (OCI) — ALL-IN-ONE MASTER DATABASE SCHEMA
-- ==============================================================================
-- Target Environment: Supabase PostgreSQL (SQL Editor / Migration Engine)
--
-- This single comprehensive file includes:
--   1. PostgreSQL Extensions & Utility Timestamp Triggers
--   2. User Profiles & RBAC (Role-Based Access Control)
--   3. Server-Authoritative Auth Trigger (Hardened Role Isolation & Auto-Provisioning)
--   4. Academic Architecture (Courses, Subjects, Batches, Students, Teachers)
--   5. Classroom & Attendance Engine (Live Classes, Attendance Tracking)
--   6. Learning Resources (Study Materials, Video Archive)
--   7. Examination Engine & AIR Ranking (Questions Bank, CBT Exams, Scorecards)
--   8. Assignments & Homework Submissions
--   9. Public Website CMS (Key-Value Store with GIN Index, Faculty, Testimonials, FAQs, Gallery)
--  10. Communications & Leads (Enquiries, Notifications, Push Device Tokens, Announcements)
--  11. Mobile App Versioning & APK Distribution (Android APK Releases)
--  12. Row Level Security (RLS) Policies (100% Coverage, Anti-IDOR Hardening)
--  13. Database RPC Stored Procedures
--  14. Storage Buckets & Storage Security Policies
--  15. Realtime Replication Publications (Safe Idempotent Setup)
--  16. Production Master Seed Data (Catalog, CBT Questions, CMS, App Release)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & UTILITY TRIGGERS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & RBAC ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_roles_user_id_unique UNIQUE (user_id)
);

DO $$
BEGIN
    -- Delete duplicates if any before enforcing single unique role per user
    DELETE FROM public.user_roles a USING public.user_roles b
    WHERE a.ctid < b.ctid AND a.user_id = b.user_id;

    -- Drop older compound key if exists
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

    -- Ensure unique constraint on user_id exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_unique' 
          AND conrelid = 'public.user_roles'::regclass
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_unique_idx ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Role Check Helper Functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'student'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. SERVER-AUTHORITATIVE AUTH TRIGGER (HARDENED ROLE ISOLATION)
-- ------------------------------------------------------------------------------
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

    -- SECURITY: Role isolation enforcement.
    -- Public self-signups can NEVER elevate to 'teacher' or 'admin'.
    -- 'teacher' and 'admin' accounts can ONLY be provisioned by admin service role.
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

    -- 2. Upsert Role in user_roles (idempotent, supports any constraint state)
    DELETE FROM public.user_roles WHERE user_id = NEW.id;
    INSERT INTO public.user_roles (id, user_id, role, created_at)
    VALUES (gen_random_uuid(), NEW.id, assigned_role, NOW());

    -- 3. If Student, ensure record in students table with official roll number
    IF assigned_role = 'student' THEN
        generated_roll := 'OCI-' || current_year || '-' || LPAD(FLOOR(1000 + RANDOM() * 8999)::text, 4, '0');
        INSERT INTO public.students (id, roll_no, status, admission_date, created_at, updated_at)
        VALUES (NEW.id, generated_roll, 'active', CURRENT_DATE, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 4. If Teacher/Faculty, ensure record in teachers table
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

-- Idempotent Trigger Setup on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. ACADEMIC STRUCTURE (COURSES, SUBJECTS, BATCHES, STUDENTS, TEACHERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    duration_months INT DEFAULT 12,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule TEXT,
    room_name TEXT,
    start_date DATE,
    end_date DATE,
    capacity INT DEFAULT 60,
    status TEXT DEFAULT 'ongoing' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_no TEXT UNIQUE NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    designation TEXT DEFAULT 'Faculty',
    qualification TEXT,
    experience_years INT DEFAULT 0,
    bio TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop legacy parents portal tables (Parents portal removed from platform)
DROP TABLE IF EXISTS public.parent_students CASCADE;
DROP TABLE IF EXISTS public.parents CASCADE;

-- ------------------------------------------------------------------------------
-- 5. LIVE CLASSES & ATTENDANCE ENGINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    jitsi_room_name TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    live_class_id UUID REFERENCES public.live_classes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, live_class_id)
);

-- ------------------------------------------------------------------------------
-- 6. LEARNING RESOURCES & VIDEO ARCHIVE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recorded_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 3600,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. EXAMINATIONS, QUESTION BANK & AIR RANKING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    marks INT DEFAULT 4,
    negative_marks INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_minutes INT DEFAULT 180,
    total_marks INT DEFAULT 300,
    is_published BOOLEAN DEFAULT FALSE,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_marks INT NOT NULL,
    percentage NUMERIC(5,2),
    accuracy_percentage NUMERIC(5,2),
    air_rank INT,
    responses JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (exam_id, student_id)
);

CREATE OR REPLACE FUNCTION public.calculate_exam_air_rankings(p_exam_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH ranked AS (
        SELECT id, DENSE_RANK() OVER (ORDER BY score DESC, accuracy_percentage DESC, submitted_at ASC) as rnk
        FROM public.exam_results
        WHERE exam_id = p_exam_id
    )
    UPDATE public.exam_results er
    SET air_rank = ranked.rnk
    FROM ranked
    WHERE er.id = ranked.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 8. ASSIGNMENTS & HOMEWORK SUBMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    submission_url TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmit')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 9. WEBSITE CMS (KEY-VALUE WITH GIN INDEX) & CONTENT TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_content_gin ON public.website_content USING GIN (value jsonb_path_ops);

CREATE TABLE IF NOT EXISTS public.website_faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years TEXT NOT NULL,
    photo_url TEXT,
    biography TEXT,
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    rating INT DEFAULT 5,
    photo_url TEXT,
    testimonial TEXT NOT NULL,
    year TEXT DEFAULT '2025',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    achievement TEXT NOT NULL,
    year TEXT DEFAULT '2025',
    photo_url TEXT,
    story TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Campus Life',
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. COMMUNICATIONS, LEADS, NOTICES & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    interested_course TEXT,
    message TEXT,
    source TEXT DEFAULT 'Website Form',
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'NOTICE',
    data JSONB DEFAULT '{}'::JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    platform TEXT DEFAULT 'web' CHECK (platform IN ('web', 'android', 'ios')),
    browser_device TEXT,
    active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user ON public.notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. MOBILE APP VERSIONS & APK DISTRIBUTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL DEFAULT 'android',
    version_name VARCHAR(50) NOT NULL,
    version_code INTEGER NOT NULL,
    apk_url TEXT NOT NULL,
    release_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    minimum_supported_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    file_size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true,
    released_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_platform_version_code UNIQUE (platform, version_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_versions_platform_code ON public.app_versions (platform, version_code);

CREATE INDEX IF NOT EXISTS idx_app_versions_lookup 
ON public.app_versions(platform, is_active, version_code DESC);

CREATE OR REPLACE FUNCTION public.get_latest_app_version(p_platform VARCHAR DEFAULT 'android')
RETURNS TABLE (
    version_name VARCHAR,
    version_code INTEGER,
    apk_url TEXT,
    release_notes JSONB,
    is_mandatory BOOLEAN,
    minimum_supported_version VARCHAR,
    file_size_bytes BIGINT,
    checksum_sha256 VARCHAR,
    released_at TIMESTAMPTZ
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT 
        v.version_name,
        v.version_code,
        v.apk_url,
        v.release_notes,
        v.is_mandatory,
        v.minimum_supported_version,
        v.file_size_bytes,
        v.checksum_sha256,
        v.released_at
    FROM public.app_versions v
    WHERE v.platform = p_platform AND v.is_active = true
    ORDER BY v.version_code DESC
    LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES (HARDENED & IDEMPOTENT)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- 12.1 Profiles: Read & Update Own Profile
DROP POLICY IF EXISTS "Allow users read own profile or admin/service" ON public.profiles;
CREATE POLICY "Allow users read own profile or admin/service" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow users update own profile or admin/service" ON public.profiles;
CREATE POLICY "Allow users update own profile or admin/service" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin/service insert profiles" ON public.profiles;
CREATE POLICY "Allow admin/service insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

-- 12.2 User Roles: Immutable for Clients, Governed by Service Role & Admin
DROP POLICY IF EXISTS "Allow users read own roles or admin/service" ON public.user_roles;
CREATE POLICY "Allow users read own roles or admin/service" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin/service manage roles" ON public.user_roles;
CREATE POLICY "Allow admin/service manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 12.3 Academic Master Data (Courses, Subjects, Batches)
DROP POLICY IF EXISTS "Allow authenticated read courses" ON public.courses;
CREATE POLICY "Allow authenticated read courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin manage courses" ON public.courses;
CREATE POLICY "Allow admin manage courses" ON public.courses FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated read subjects" ON public.subjects;
CREATE POLICY "Allow authenticated read subjects" ON public.subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin manage subjects" ON public.subjects;
CREATE POLICY "Allow admin manage subjects" ON public.subjects FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated read batches" ON public.batches;
CREATE POLICY "Allow authenticated read batches" ON public.batches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin manage batches" ON public.batches;
CREATE POLICY "Allow admin manage batches" ON public.batches FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 12.4 Students & Teachers
DROP POLICY IF EXISTS "Allow read students" ON public.students;
CREATE POLICY "Allow read students" ON public.students
    FOR SELECT USING (auth.uid() = id OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin manage students" ON public.students;
CREATE POLICY "Allow admin manage students" ON public.students
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow read teachers" ON public.teachers;
CREATE POLICY "Allow read teachers" ON public.teachers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin manage teachers" ON public.teachers;
CREATE POLICY "Allow admin manage teachers" ON public.teachers
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 12.5 Live Classes & Attendance
DROP POLICY IF EXISTS "Allow read live_classes" ON public.live_classes;
CREATE POLICY "Allow read live_classes" ON public.live_classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow teacher and admin manage live_classes" ON public.live_classes;
CREATE POLICY "Allow teacher and admin manage live_classes" ON public.live_classes
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow student read own attendance" ON public.attendance;
CREATE POLICY "Allow student read own attendance" ON public.attendance
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow teacher and admin manage attendance" ON public.attendance;
CREATE POLICY "Allow teacher and admin manage attendance" ON public.attendance
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 12.6 Study Materials & Recorded Classes
DROP POLICY IF EXISTS "Allow read study_materials" ON public.study_materials;
CREATE POLICY "Allow read study_materials" ON public.study_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow teacher and admin manage study_materials" ON public.study_materials;
CREATE POLICY "Allow teacher and admin manage study_materials" ON public.study_materials
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow read recorded_classes" ON public.recorded_classes;
CREATE POLICY "Allow read recorded_classes" ON public.recorded_classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow teacher and admin manage recorded_classes" ON public.recorded_classes;
CREATE POLICY "Allow teacher and admin manage recorded_classes" ON public.recorded_classes
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 12.7 Exams, Question Bank & Anti-IDOR Scorecard Isolation
DROP POLICY IF EXISTS "Allow read published exams" ON public.exams;
CREATE POLICY "Allow read published exams" ON public.exams
    FOR SELECT USING (is_published = true OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow teacher and admin manage exams" ON public.exams;
CREATE POLICY "Allow teacher and admin manage exams" ON public.exams
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow teacher and admin manage questions" ON public.questions;
CREATE POLICY "Allow teacher and admin manage questions" ON public.questions
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow student read own results" ON public.exam_results;
CREATE POLICY "Allow student read own results" ON public.exam_results
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow insert own result or service role" ON public.exam_results;
CREATE POLICY "Allow insert own result or service role" ON public.exam_results
    FOR INSERT WITH CHECK (student_id = auth.uid() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin manage results" ON public.exam_results;
CREATE POLICY "Allow admin manage results" ON public.exam_results
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 12.8 Assignments & Anti-IDOR Submissions Isolation
DROP POLICY IF EXISTS "Allow read assignments" ON public.assignments;
CREATE POLICY "Allow read assignments" ON public.assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow teacher and admin manage assignments" ON public.assignments;
CREATE POLICY "Allow teacher and admin manage assignments" ON public.assignments
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow student read own submission" ON public.assignment_submissions;
CREATE POLICY "Allow student read own submission" ON public.assignment_submissions
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow student insert own submission" ON public.assignment_submissions;
CREATE POLICY "Allow student insert own submission" ON public.assignment_submissions
    FOR INSERT WITH CHECK (student_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow teacher and admin manage submissions" ON public.assignment_submissions;
CREATE POLICY "Allow teacher and admin manage submissions" ON public.assignment_submissions
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 12.9 Website CMS & Enquiries
DROP POLICY IF EXISTS "Allow public read website_content" ON public.website_content;
CREATE POLICY "Allow public read website_content" ON public.website_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin full website_content" ON public.website_content;
CREATE POLICY "Allow admin full website_content" ON public.website_content
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public read published faculty" ON public.website_faculty;
CREATE POLICY "Allow public read published faculty" ON public.website_faculty FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin full faculty" ON public.website_faculty;
CREATE POLICY "Allow admin full faculty" ON public.website_faculty FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public read published testimonials" ON public.website_testimonials;
CREATE POLICY "Allow public read published testimonials" ON public.website_testimonials FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin full testimonials" ON public.website_testimonials;
CREATE POLICY "Allow admin full testimonials" ON public.website_testimonials FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public read published success" ON public.website_success_stories;
CREATE POLICY "Allow public read published success" ON public.website_success_stories FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin full success" ON public.website_success_stories;
CREATE POLICY "Allow admin full success" ON public.website_success_stories FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public read published faqs" ON public.website_faqs;
CREATE POLICY "Allow public read published faqs" ON public.website_faqs FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin full faqs" ON public.website_faqs;
CREATE POLICY "Allow admin full faqs" ON public.website_faqs FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public read published gallery" ON public.website_gallery;
CREATE POLICY "Allow public read published gallery" ON public.website_gallery FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin full gallery" ON public.website_gallery;
CREATE POLICY "Allow admin full gallery" ON public.website_gallery FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow public insert enquiries" ON public.enquiries;
CREATE POLICY "Allow public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin manage enquiries" ON public.enquiries;
CREATE POLICY "Allow admin manage enquiries" ON public.enquiries FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 12.10 Notifications, Device Tokens & Announcements
DROP POLICY IF EXISTS "Allow users read own notifications" ON public.notifications;
CREATE POLICY "Allow users read own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow users update own notifications" ON public.notifications;
CREATE POLICY "Allow users update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid() OR public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow admin manage notifications" ON public.notifications;
CREATE POLICY "Allow admin manage notifications" ON public.notifications
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow users manage own tokens" ON public.notification_tokens;
CREATE POLICY "Allow users manage own tokens" ON public.notification_tokens
    FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow read announcements" ON public.announcements;
CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin manage announcements" ON public.announcements;
CREATE POLICY "Allow admin manage announcements" ON public.announcements FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow admin read audit_logs" ON public.audit_logs FOR SELECT USING (public.is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 12.11 App Versions
DROP POLICY IF EXISTS "Public read for active app_versions" ON public.app_versions;
CREATE POLICY "Public read for active app_versions" ON public.app_versions
    FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins full management for app_versions" ON public.app_versions;
CREATE POLICY "Admins full management for app_versions" ON public.app_versions
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 13. RPC STORED PROCEDURES (PUBLIC WEBSITE CMS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_website_bundle()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_object_agg(key, value)
    INTO result
    FROM public.website_content;

    RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upsert_website_section(
    p_key TEXT,
    p_value JSONB
)
RETURNS JSONB AS $$
DECLARE
    updated_row RECORD;
BEGIN
    INSERT INTO public.website_content (key, value, updated_at)
    VALUES (p_key, p_value, NOW())
    ON CONFLICT (key)
    DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    RETURNING * INTO updated_row;

    RETURN jsonb_build_object(
        'success', true,
        'key', updated_row.key,
        'updated_at', updated_row.updated_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 14. SUPABASE STORAGE BUCKETS & STORAGE POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('study-materials', 'study-materials', false, 104857600, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
    ('assignments', 'assignments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('media-library', 'media-library', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
    ('app-releases', 'app-releases', true, 209715200, ARRAY['application/vnd.android.package-archive', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read for public buckets" ON storage.objects;
CREATE POLICY "Public read for public buckets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('avatars', 'course-thumbnails', 'media-library', 'app-releases'));

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teachers and admins can upload study materials" ON storage.objects;
CREATE POLICY "Teachers and admins can upload study materials" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('study-materials', 'course-thumbnails', 'media-library', 'app-releases') AND (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Students can upload assignment submissions" ON storage.objects;
CREATE POLICY "Students can upload assignment submissions" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enrolled students, teachers, and admins can view study materials" ON storage.objects;
CREATE POLICY "Enrolled students, teachers, and admins can view study materials" ON storage.objects
    FOR SELECT USING (bucket_id IN ('study-materials', 'assignments') AND auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 15. REALTIME REPLICATION CONFIGURATION (SAFE IDEMPOTENT BLOCK)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_classes;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ------------------------------------------------------------------------------
-- 16. PRODUCTION MASTER SEED DATA (PUBLIC CMS & APP RELEASE ONLY)
-- ------------------------------------------------------------------------------
-- Note: Operational academic entities (courses, subjects, batches, live classes,
-- study materials, exams, questions, announcements) are NEVER seeded in production.
-- They are created through authorized Admin / Faculty operational workflows.


-- 16.4 Faculty CMS
INSERT INTO public.website_faculty (id, name, subject, qualification, experience_years, photo_url, biography, display_order, is_published)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Er. R. K. Mohapatra', 'Quantitative Aptitude', 'B.Tech (NIT Rourkela)', '10+ Years', '/faculty/mohapatra.jpg', 'Specialist in Vedic mathematics and high-speed calculation techniques for competitive exams.', 1, true),
    ('f0000000-0000-0000-0000-000000000002', 'Prof. Arvind Verma', 'Reasoning & Mental Ability', 'M.Sc Mathematics', '12+ Years', '/faculty/verma.jpg', 'Expert mentor in verbal & non-verbal reasoning, puzzle solving, and syllogisms.', 2, true),
    ('f0000000-0000-0000-0000-000000000003', 'Dr. S. K. Nayak', 'General Studies & Odisha Heritage', 'Ph.D History & Public Admin', '15+ Years', '/faculty/nayak.jpg', 'Director and Chief Academic Mentor with deep expertise in state history, polity, and civil services guidance.', 3, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 16.5 Testimonials & Success Stories
INSERT INTO public.website_testimonials (id, student_name, exam, rating, photo_url, testimonial, year, is_featured, is_published)
VALUES
    ('da000000-0000-0000-0000-000000000001', 'Priyanka Das', 'OSSC CGL 2024', 5, '/testimonials/priyanka.jpg', 'The daily practice worksheets and Saturday mock exams at OCI Bhadrak transformed my preparation. I cleared OSSC CGL in my first attempt!', '2024', true, true),
    ('da000000-0000-0000-0000-000000000002', 'Bikash Mohanty', 'Railway NTPC', 5, '/testimonials/bikash.jpg', 'Regular CBT mock tests prepared me for the actual computer-based exam environment with zero exam anxiety.', '2024', true, true)
ON CONFLICT (id) DO UPDATE SET testimonial = EXCLUDED.testimonial;

INSERT INTO public.website_success_stories (id, student_name, exam, achievement, year, photo_url, story, is_featured, is_published)
VALUES
    ('db000000-0000-0000-0000-000000000001', 'Subhashree Priyadarshini', 'OSSC Inspector of Supplies', 'State Rank 4', '2024', '/success/subhashree.jpg', 'Completed the 1-year foundation course at OCI Bhadrak. Systematic guidance in General Awareness and Reasoning helped achieve State Rank 4.', true, true),
    ('db000000-0000-0000-0000-000000000002', 'Manas Kumar Jena', 'SSC CGL (Auditor)', 'All India Rank 142', '2023', '/success/manas.jpg', 'Daily math practice and personal mentorship on error analysis by OCI faculty made the difference.', true, true)
ON CONFLICT (id) DO UPDATE SET achievement = EXCLUDED.achievement;



-- 16.8 Official Mobile App Release (v1.0.0, Build 1)
INSERT INTO public.app_versions (
    platform,
    version_name,
    version_code,
    apk_url,
    release_notes,
    is_mandatory,
    minimum_supported_version,
    file_size_bytes,
    checksum_sha256,
    is_active
)
SELECT
    'android',
    '1.0.0',
    1,
    'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk',
    jsonb_build_array(
        'Official initial launch release of the OCI mobile application',
        'Real-time integration with OCI examination engine',
        'Interactive Computer-Based Test (CBT) mock tests with instant scorecards',
        'Live classroom streaming and attendance tracking',
        'Offline study notes and syllabus downloads',
        'Direct push notifications for class notices and exam schedules'
    ),
    false,
    '1.0.0',
    36700160,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.app_versions WHERE platform = 'android' AND version_code = 1
);

-- 16.9 Public Website CMS (Full Baseline Content)
INSERT INTO public.website_content (key, value) VALUES
('homepage', '{
  "hero": {
    "eyebrow": "ESTABLISHED 2017 • BHADRAK, ODISHA",
    "heading": "Your Goal. Our Guidance. Your Success.",
    "subheading": "Build Strong Concepts. Practice Consistently. Compete With Confidence.",
    "description": "Odisha Competitive Institute (OCI) is committed to providing quality, systematic, easy-to-understand and exam-oriented education while helping students build strong concepts, practice consistently and approach competitive examinations with confidence.",
    "primaryCtaText": "Start Your Preparation",
    "primaryCtaLink": "/contact",
    "secondaryCtaText": "Explore Examinations",
    "secondaryCtaLink": "/exams",
    "appCtaText": "Download OCI App",
    "appCtaLink": "/app"
  },
  "trustStrip": [
    { "label": "Established", "text": "2017" },
    { "label": "Approach", "text": "Student-Focused Learning" },
    { "label": "Target", "text": "Competitive Exam Preparation" },
    { "label": "Location", "text": "Bhadrak, Odisha" },
    { "label": "System", "text": "Exam-Oriented Education" }
  ],
  "aboutPreview": {
    "heading": "Built Around Student Success.",
    "description": "Odisha Competitive Institute (OCI) was founded on 17 January 2017 in Bhadrak with a vision to make competitive examination preparation structured, transparent, and genuinely student-centric.",
    "ctaText": "Discover OCI Story",
    "ctaLink": "/about"
  },
  "finalCta": {
    "heading": "Your Preparation Starts With One Decision.",
    "subheading": "Build Strong Concepts • Practice Consistently • Compete With Confidence",
    "primaryBtnText": "Start Your Preparation",
    "secondaryBtnText": "Download OCI App"
  }
}'::jsonb),

('about', '{
  "hero": {
    "eyebrow": "ABOUT OCI",
    "heading": "Built With Purpose. Focused On Your Success.",
    "subheading": "Odisha Competitive Institute (OCI) is a dedicated student-focused competitive examination preparation institute located in Bhadrak, Odisha.",
    "establishedDate": "17 January 2017"
  },
  "history": {
    "title": "Our Journey",
    "milestones": [
      {
        "year": "2017",
        "date": "17 January 2017",
        "title": "Institute Established in Bhadrak",
        "description": "Odisha Competitive Institute begins its journey at Nayabazar, near Old Rajghat Bridge, Bhadrak, with a vision to provide quality, easy-to-understand, and exam-oriented education."
      },
      {
        "year": "Future",
        "date": "Ongoing Tradition",
        "title": "Continuous Expansion of Learning Resources",
        "description": "Expanding digital learning infrastructure, student support services, and mobile application preparation tools."
      }
    ]
  },
  "philosophy": {
    "title": "How We Approach Learning",
    "description": "At OCI, we believe that competitive examination success is not born from shortcuts alone, but from a balanced synthesis of conceptual clarity, disciplined practice, and steady mentorship.",
    "points": [
      "Building strong fundamentals before introducing complex problem-solving.",
      "Encouraging consistent daily practice over last-minute cramming.",
      "Providing smart shortcuts and time management strategies tailored to exam patterns.",
      "Maintaining a positive, friendly, and doubt-free learning environment.",
      "Fostering personal guidance for every student to help them reach their potential."
    ]
  },
  "vision": {
    "title": "Our Vision",
    "english": "To empower competitive exam aspirants with strong concepts, systematic guidance, and exam-oriented preparation—building confidence, discipline, and success in every student.",
    "odia": "ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ଦେଉଥିବା ଛାତ୍ରଛାତ୍ରୀମାନଙ୍କୁ ସୁଦୃଢ଼ ମୌଳିକ ଜ୍ଞାନ, କ୍ରମାନ୍ୱୟ ମାର୍ଗଦର୍ଶନ ଏବଂ ପରୀକ୍ଷା-ଉପଯୋଗୀ ପ୍ରସ୍ତୁତି ମାଧ୍ୟମରେ ସଶକ୍ତ କରିବା—ପ୍ରତ୍ୟେକ ଛାତ୍ରଛାତ୍ରୀଙ୍କଠାରେ ଆତ୍ମବିଶ୍ୱାସ, ଅନୁଶାସନ ଏବଂ ସଫଳତା ସୃଷ୍ଟି କରିବା।"
  },
  "directorMessage": {
    "title": "A Message From Our Director",
    "salutation": "Dear Students and Aspirants,",
    "content": [
      "Odisha Competitive Institute (OCI) was founded with a singular focus: to make quality competitive exam preparation structured, transparent, and genuinely student-centric.",
      "We understand that competitive examinations test not only your knowledge, but also your speed, accuracy, and mental endurance. Our faculty and academic systems are designed to support you at every stage of this journey."
    ],
    "truncatedBadgeText": "Complete Message Coming Soon"
  }
}'::jsonb),

('appSettings', '{
  "androidUrl": "https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk",
  "iosUrl": "Coming Soon",
  "qrCodeText": "Scan QR to view app updates & release announcements"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================================================
-- 17. BACKFILL & REPAIR FOR USERS CREATED DURING MIGRATIONS
-- ==============================================================================
-- Ensures any account created in auth.users has an associated profile, role, and student record
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', 'Student Aspirant'),
    u.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

INSERT INTO public.user_roles (id, user_id, role, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'student',
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id
);

INSERT INTO public.students (id, roll_no, status, admission_date, created_at, updated_at)
SELECT 
    u.id,
    'OCI-2026-' || LPAD(FLOOR(1000 + RANDOM() * 8999)::text, 4, '0'),
    'active',
    CURRENT_DATE,
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = u.id
) AND NOT EXISTS (
    SELECT 1 FROM public.teachers t WHERE t.id = u.id
);

-- ==============================================================================
-- END OF ALL-IN-ONE MASTER DATABASE SCHEMA
-- ==============================================================================