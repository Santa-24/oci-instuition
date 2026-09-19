-- ==============================================================================
-- ODISHA COMPETITIVE INSTITUTE (OCI) — PRODUCTION-READY MASTER POSTGRESQL MIGRATION
-- ==============================================================================
-- Architecture: Supabase PostgreSQL + Auth + Storage + Realtime + RLS
-- Target: Cloudflare + Vercel + Render + Supabase + Firebase FCM + Upstash Redis
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

-- ------------------------------------------------------------------------------
-- 1. PROFILES & USER ROLES
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
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Role Check Helper Functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'teacher'
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
-- 2. ACADEMIC STRUCTURE (COURSES, SUBJECTS, BATCHES)
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

-- ------------------------------------------------------------------------------
-- 3. STUDENTS, TEACHERS, PARENTS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. LIVE CLASSES & ATTENDANCE
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
-- 5. STUDY MATERIALS & RECORDINGS
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
-- 6. EXAMS, QUESTION BANK & SCORECARDS
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

-- ------------------------------------------------------------------------------
-- 7. ASSIGNMENTS & HOMEWORK SUBMISSIONS
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
-- 8. WEBSITE CMS (KEY-VALUE WITH GIN INDEX) & ENQUIRIES
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

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS & FCM DEVICE TOKENS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ------------------------------------------------------------------------------
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
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
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

-- 11.1 Profiles
CREATE POLICY "Allow users read own profile or admin/service" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow users update own profile or admin/service" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin/service insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

-- 11.2 User Roles
CREATE POLICY "Allow users read own roles or admin/service" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin/service manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 11.3 Academic Master Data (Courses, Subjects, Batches)
CREATE POLICY "Allow authenticated read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow admin manage courses" ON public.courses FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow admin manage subjects" ON public.subjects FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated read batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow admin manage batches" ON public.batches FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 11.4 Students & Teachers
CREATE POLICY "Allow read students" ON public.students
    FOR SELECT USING (auth.uid() = id OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin manage students" ON public.students
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow admin manage teachers" ON public.teachers
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 11.5 Live Classes & Attendance
CREATE POLICY "Allow read live_classes" ON public.live_classes
    FOR SELECT USING (true);
CREATE POLICY "Allow teacher and admin manage live_classes" ON public.live_classes
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow student read own attendance" ON public.attendance
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow teacher and admin manage attendance" ON public.attendance
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 11.6 Study Materials & Recorded Classes
CREATE POLICY "Allow read study_materials" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Allow teacher and admin manage study_materials" ON public.study_materials
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow read recorded_classes" ON public.recorded_classes FOR SELECT USING (true);
CREATE POLICY "Allow teacher and admin manage recorded_classes" ON public.recorded_classes
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 11.7 Exams, Questions & Results
CREATE POLICY "Allow read published exams" ON public.exams
    FOR SELECT USING (is_published = true OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow teacher and admin manage exams" ON public.exams
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow teacher and admin manage questions" ON public.questions
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow student read own results" ON public.exam_results
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow insert own result or service role" ON public.exam_results
    FOR INSERT WITH CHECK (student_id = auth.uid() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin manage results" ON public.exam_results
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 11.8 Assignments
CREATE POLICY "Allow read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow teacher and admin manage assignments" ON public.assignments
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow student read own submission" ON public.assignment_submissions
    FOR SELECT USING (student_id = auth.uid() OR public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow student insert own submission" ON public.assignment_submissions
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Allow teacher and admin manage submissions" ON public.assignment_submissions
    FOR ALL USING (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role');

-- 11.9 Website CMS & Enquiries
CREATE POLICY "Allow public read website_content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Allow admin full website_content" ON public.website_content
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

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

-- 11.10 Notifications & Tokens
CREATE POLICY "Allow users read own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow users update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid() OR public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow admin manage notifications" ON public.notifications
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow users manage own tokens" ON public.notification_tokens
    FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow admin manage announcements" ON public.announcements FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin read audit_logs" ON public.audit_logs FOR SELECT USING (public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 12. RPC STORED PROCEDURES
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

CREATE OR REPLACE FUNCTION public.calculate_exam_air_rankings(p_exam_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Updates AIR ranks sequentially based on highest score and accuracy
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
-- 13. SUPABASE STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------------------
-- Insert buckets into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('study-materials', 'study-materials', false, 104857600, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
    ('assignments', 'assignments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('media-library', 'media-library', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS
CREATE POLICY "Public read for public buckets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('avatars', 'course-thumbnails', 'media-library'));

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers and admins can upload study materials" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('study-materials', 'course-thumbnails', 'media-library') AND (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role'));

CREATE POLICY "Students can upload assignment submissions" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');

CREATE POLICY "Enrolled students, teachers, and admins can view study materials" ON storage.objects
    FOR SELECT USING (bucket_id IN ('study-materials', 'assignments') AND auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 14. REALTIME REPLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
-- Enable Supabase Realtime publication on crucial tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
