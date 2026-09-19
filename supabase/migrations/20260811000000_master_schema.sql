-- ==============================================================================
-- ODISHA COMPETITIVE INSTITUTE (OCI) — MASTER POSTGRESQL SCHEMA WITH RLS & RPCs
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES & USER ROLES
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
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ACADEMIC STRUCTURE (COURSES, SUBJECTS, BATCHES)
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

-- 3. STUDENTS, TEACHERS, PARENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_no TEXT UNIQUE NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    qualification TEXT,
    experience_years INT DEFAULT 0,
    bio TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    occupation TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parent_students (
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

-- 4. LIVE CLASSES & ATTENDANCE
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
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDY MATERIALS & RECORDINGS
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

-- 6. EXAMS & QUESTION BANK
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium',
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
    accuracy_percentage NUMERIC(5,2),
    air_rank INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);



-- 8. WEBSITE CMS (KEY-VALUE WITH GIN INDEX) & ENQUIRIES
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

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read website_content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Allow admin full website_content" ON public.website_content FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published faculty" ON public.website_faculty FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin full faculty" ON public.website_faculty FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published testimonials" ON public.website_testimonials FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin full testimonials" ON public.website_testimonials FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published success" ON public.website_success_stories FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin full success" ON public.website_success_stories FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published faqs" ON public.website_faqs FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin full faqs" ON public.website_faqs FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published gallery" ON public.website_gallery FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin full gallery" ON public.website_gallery FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage enquiries" ON public.enquiries FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 11. RPC STORED PROCEDURES
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
