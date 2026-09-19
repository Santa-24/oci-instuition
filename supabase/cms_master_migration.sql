-- ==============================================================================
-- ODISHA COMPETITIVE INSTITUTE (OCI) — MASTER POSTGRESQL & CMS SCHEMA (OPTIMIZED)
-- ==============================================================================
-- Module: Supabase PostgreSQL Database, RLS Policies, Indexes, Triggers & RPCs
-- Target: Public Website CMS, Master Admin Dashboard, Mobile Client & Enquiries
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. HELPER TRIGGER FUNCTION FOR AUTOMATIC TIMESTAMP MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & ROLES
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

-- Helper function to check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. CENTRAL WEBSITE CMS KEY-VALUE STORE (JSONB + GIN INDEX)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_content_gin ON public.website_content USING GIN (value jsonb_path_ops);

DROP TRIGGER IF EXISTS trg_website_content_timestamp ON public.website_content;
CREATE TRIGGER trg_website_content_timestamp
    BEFORE UPDATE ON public.website_content
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 4. RELATIONAL CMS TABLES FOR STRUCTURED DATA
-- ------------------------------------------------------------------------------

-- 4.1 Faculty Profiles
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_faculty_order ON public.website_faculty(display_order ASC, is_published);

-- 4.2 Testimonials & Student Reviews
CREATE TABLE IF NOT EXISTS public.website_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    photo_url TEXT,
    testimonial TEXT NOT NULL,
    year TEXT DEFAULT '2025',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_testimonials_featured ON public.website_testimonials(is_featured, is_published);

-- 4.3 Success Stories & Hall of Fame
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

CREATE INDEX IF NOT EXISTS idx_website_success_featured ON public.website_success_stories(is_featured, is_published);

-- 4.4 Frequently Asked Questions (FAQs)
CREATE TABLE IF NOT EXISTS public.website_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_faqs_category ON public.website_faqs(category, display_order ASC);

-- 4.5 Campus & Events Gallery
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
-- 5. ADMISSIONS LEADS & ENQUIRIES
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
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries(phone);

DROP TRIGGER IF EXISTS trg_enquiries_timestamp ON public.enquiries;
CREATE TRIGGER trg_enquiries_timestamp
    BEFORE UPDATE ON public.enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 6.1 website_content RLS
-- Anyone (anon/authenticated) can read website content
CREATE POLICY "Allow public read website_content"
    ON public.website_content FOR SELECT
    USING (true);

-- Admins can update/insert/delete website content
CREATE POLICY "Allow admin full access to website_content"
    ON public.website_content FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 6.2 Relational CMS Tables RLS
CREATE POLICY "Allow public read published faculty"
    ON public.website_faculty FOR SELECT
    USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to faculty"
    ON public.website_faculty FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published testimonials"
    ON public.website_testimonials FOR SELECT
    USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to testimonials"
    ON public.website_testimonials FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published success stories"
    ON public.website_success_stories FOR SELECT
    USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to success stories"
    ON public.website_success_stories FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published faqs"
    ON public.website_faqs FOR SELECT
    USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to faqs"
    ON public.website_faqs FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public read published gallery"
    ON public.website_gallery FOR SELECT
    USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to gallery"
    ON public.website_gallery FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 6.3 enquiries RLS
-- Anyone can submit an enquiry from the website
CREATE POLICY "Allow public insert enquiries"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

-- Only Admins can view and update enquiries
CREATE POLICY "Allow admin read and manage enquiries"
    ON public.enquiries FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 7. ULTRA-FAST STORED PROCEDURES (RPCs)
-- ------------------------------------------------------------------------------

-- 7.1 Single-Roundtrip Full Website Bundle RPC
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

-- 7.2 Atomic Website Section Upsert RPC
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

-- 7.3 Submit Enquiry RPC
CREATE OR REPLACE FUNCTION public.submit_website_enquiry(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_course TEXT DEFAULT 'General Enquiry',
    p_message TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'Website Form'
)
RETURNS JSONB AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.enquiries (name, phone, email, interested_course, message, source, status)
    VALUES (p_name, p_phone, p_email, p_course, p_message, p_source, 'NEW')
    RETURNING id INTO new_id;

    RETURN jsonb_build_object(
        'success', true,
        'enquiry_id', new_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 8. COMPREHENSIVE INITIAL SEED DATA FOR OCI BHADRAK
-- ------------------------------------------------------------------------------

-- 8.1 Homepage CMS
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
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.2 About OCI CMS
INSERT INTO public.website_content (key, value) VALUES
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
        "year": "2020-2024",
        "date": "Expansion Phase",
        "title": "Comprehensive Central & State Exam Prep",
        "description": "Expanded academic faculty and mock test systems across SSC, OSSSC, OSSC, Banking, and Railway divisions."
      },
      {
        "year": "2025+",
        "date": "Digital Evolution",
        "title": "Integrated Learning App & Hybrid Classrooms",
        "description": "Launching OCI Smart Learning Mobile App with CBT practice exams, recorded lectures, and live attendance tracking."
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
  "directorMessage": {
    "title": "A Message From Our Director",
    "salutation": "Dear Students and Parents,",
    "content": [
      "Odisha Competitive Institute (OCI) was founded with a singular focus: to make quality competitive exam preparation structured, transparent, and genuinely student-centric.",
      "We understand that competitive examinations test not only your knowledge, but also your speed, accuracy, and mental endurance. Our faculty and academic systems are designed to support you at every stage of this journey."
    ]
  },
  "coreValues": [
    { "title": "Student-Centricity", "description": "Every syllabus plan, doubt session, and practice test is designed around the student's real exam needs." },
    { "title": "Conceptual Clarity", "description": "We teach the core logic first so students can solve unseen exam variations with speed and precision." },
    { "title": "Consistency & Discipline", "description": "Daily practice papers and regular revision schedules ensure retention until exam day." },
    { "title": "Transparency & Ethics", "description": "Honest feedback, transparent fee structures, and verified student achievements." }
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.3 Vision & Mission CMS
INSERT INTO public.website_content (key, value) VALUES
('vision', '{
  "english": "To empower competitive exam aspirants with strong concepts, systematic guidance, and exam-oriented preparation—building confidence, discipline, and success in every student.",
  "odia": "ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ଦେଉଥିବା ଛାତ୍ରଛାତ୍ରୀମାନଙ୍କୁ ସୁଦୃଢ଼ ମୌଳିକ ଜ୍ଞାନ, କ୍ରମାନ୍ୱୟ ମାର୍ଗଦର୍ଶନ ଏବଂ ପରୀକ୍ଷା-ଉପଯୋଗୀ ପ୍ରସ୍ତୁତି ମାଧ୍ୟମରେ ସଶକ୍ତ କରିବା—ପ୍ରତ୍ୟେକ ଛାତ୍ରଛାତ୍ରୀଙ୍କଠାରେ ଆତ୍ମବିଶ୍ୱାସ, ଅନୁଶାସନ ଏବଂ ସଫଳତା ସୃଷ୍ଟି କରିବା।",
  "missionPoints": [
    "Deliver top-tier coaching with clear explanations in English and Odia.",
    "Provide updated study material aligned with the latest exam patterns.",
    "Conduct weekly mock tests with detailed performance analysis.",
    "Ensure zero-doubt classrooms with individual teacher attention."
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.4 Why OCI CMS (8 Pillars & Learning Journey)
INSERT INTO public.website_content (key, value) VALUES
('whyOci', '{
  "pillars": [
    {
      "id": "student-centric",
      "number": "01",
      "title": "Student-Centric Approach",
      "description": "Every lecture, practice module, and doubt-clearing session is structured around students'' individual learning pace."
    },
    {
      "id": "concept-first",
      "number": "02",
      "title": "Strong Conceptual Foundation",
      "description": "We focus on building rock-solid fundamentals before advancing to shortcuts and high-speed tricks."
    },
    {
      "id": "exam-oriented",
      "number": "03",
      "title": "Exam-Oriented Syllabus Design",
      "description": "Our curriculum is continuously updated to match exact question patterns of SSC, Odisha Govt, Railway, and Banking exams."
    },
    {
      "id": "structured-curriculum",
      "number": "04",
      "title": "Step-by-Step Systematic Learning",
      "description": "A logically organized roadmap from basics to advanced topics ensures no gaps in preparation."
    },
    {
      "id": "practice-system",
      "number": "05",
      "title": "Daily Practice & Revision Routine",
      "description": "Daily practice worksheets, weekly tests, and revision marathons build speed and accuracy."
    },
    {
      "id": "friendly-environment",
      "number": "06",
      "title": "Supportive & Doubt-Free Environment",
      "description": "An approachable atmosphere where students are encouraged to ask questions freely without hesitation."
    },
    {
      "id": "personal-mentorship",
      "number": "07",
      "title": "Individual Attention & Guidance",
      "description": "One-on-one mentorship to identify student strengths, correct weaknesses, and manage exam anxiety."
    },
    {
      "id": "discipline-focus",
      "number": "08",
      "title": "Discipline, Confidence & Consistency",
      "description": "Cultivating the mindset, mental stamina, and daily habits essential for clearing government competitive exams."
    }
  ],
  "journey": [
    { "step": "01", "title": "Concept Foundation", "description": "Master core subjects from fundamentals with clear, structured explanations." },
    { "step": "02", "title": "Topic-Wise Practice", "description": "Solve graded practice sets and past-year questions for each topic." },
    { "step": "03", "title": "Mock Tests & Analysis", "description": "Simulate real exam conditions with timed CBT mock tests and in-depth performance reviews." },
    { "step": "04", "title": "Revision & Strategy", "description": "Fine-tune speed, eliminate negative marking, and lock in exam-day readiness." }
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.5 App Showcase Settings CMS
INSERT INTO public.website_content (key, value) VALUES
('appSettings', '{
  "androidUrl": "https://play.google.com/store/apps/details?id=com.oci.mobile",
  "iosUrl": "https://apps.apple.com/app/oci-learning/id123456789",
  "qrCodeText": "Scan QR to download the OCI Mobile App on Android & iOS",
  "features": [
    { "title": "Live & Recorded Classes", "description": "Attend live video lectures or watch recorded sessions anytime." },
    { "title": "CBT Mock Test Series", "description": "Real exam simulation with instant rankings and time tracking." },
    { "title": "Digital Notes & DPPs", "description": "Download chapter summaries and daily practice problem sets." },
    { "title": "Attendance & Performance", "description": "Real-time attendance logs and graphical progress reports." }
  ]
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.6 SEO Settings CMS
INSERT INTO public.website_content (key, value) VALUES
('seo', '{
  "siteTitle": "Odisha Competitive Institute | Your Success, Our Tradition",
  "siteDescription": "Odisha Competitive Institute (OCI) in Bhadrak provides quality coaching for SSC, Odisha Govt, Railway, Banking, and Teaching examinations.",
  "keywords": ["Odisha Competitive Institute", "OCI Bhadrak", "SSC Coaching Odisha", "OSSSC Exam Prep", "Banking Coaching Bhadrak", "Best Coaching Bhadrak"],
  "canonicalDomain": "https://oci-institute.edu",
  "ogImageUrl": "/oci-logo.png"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.7 Site Settings CMS
INSERT INTO public.website_content (key, value) VALUES
('settings', '{
  "name": "Odisha Competitive Institute",
  "shortName": "OCI",
  "tagline": "Your Goal. Our Guidance. Your Success.",
  "subTagline": "Build Strong Concepts. Practice Consistently. Compete With Confidence.",
  "established": "17 January 2017",
  "location": "Bhadrak, Odisha",
  "address": "Nayabazar, near Old Rajghat Bridge, Bhadrak, Odisha — 756100",
  "phone": "7205021878",
  "whatsapp": "7655004403",
  "email": "contact@oci-institute.edu",
  "timings": "8:00 AM – 8:00 PM (Monday to Sunday)",
  "social": {
    "facebook": "https://facebook.com/ocibhadrak",
    "youtube": "https://youtube.com/@ocibhadrak",
    "telegram": "https://t.me/ocibhadrak",
    "whatsapp": "https://wa.me/917655004403"
  }
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8.8 Initial Relational FAQs Seed Data
INSERT INTO public.website_faqs (question, answer, category, display_order, is_published)
VALUES
('What competitive exams does OCI prepare students for?', 'OCI provides comprehensive preparation for SSC (CGL, CHSL, MTS, GD), Odisha State Govt (OSSC, OSSSC, Police SI/Constable), Railways (RRB NTPC, Group D), Banking (IBPS, SBI), and Teaching exams.', 'General', 1, true),
('Where is OCI situated in Bhadrak?', 'OCI is conveniently located at Nayabazar, near Old Rajghat Bridge, Bhadrak, Odisha — 756100.', 'Location', 2, true),
('What are the institute office and admission timings?', 'Our Bhadrak campus and enquiry desk are open from 8:00 AM to 8:00 PM every day (Monday to Sunday). You can also reach us via phone at 7205021878 or WhatsApp at 7655004403.', 'Admissions', 3, true),
('Does OCI offer study materials and test series?', 'Yes! Every enrolled student receives printed chapter-wise study modules, daily practice papers (DPPs), and access to full-length computer-based mock test series.', 'Academics', 4, true)
ON CONFLICT DO NOTHING;

-- 8.9 Initial Sample Enquiry
INSERT INTO public.enquiries (name, phone, email, interested_course, message, source, status)
VALUES
('Subhashree Mohanty', '7205021878', 'subhashree@example.com', 'OSSC Combined Graduate Level', 'Interested in joining upcoming morning batch for OSSC CGL 2026.', 'Website Form', 'NEW')
ON CONFLICT DO NOTHING;
