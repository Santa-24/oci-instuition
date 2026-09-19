-- ==============================================================================
-- OCI PLATFORM — APP VERSIONS & APK DISTRIBUTION MIGRATION
-- Migration: 20260918140000_app_versions_and_apk_distribution.sql
-- ==============================================================================

-- 1. Create app_versions table
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

-- Index for fast version lookup
CREATE INDEX IF NOT EXISTS idx_app_versions_lookup 
ON public.app_versions(platform, is_active, version_code DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active app releases (public access for app update checks)
CREATE POLICY "Public read for active app_versions" 
ON public.app_versions
FOR SELECT 
USING (is_active = true);

-- Policy: Admins and service role have full management access
CREATE POLICY "Admins full management for app_versions" 
ON public.app_versions
FOR ALL 
USING (public.is_admin() OR auth.role() = 'service_role')
WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 2. Storage Bucket for APK Releases
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'app-releases',
    'app-releases',
    true,
    209715200, -- 200 MB limit for mobile APK binaries
    ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for app-releases bucket
CREATE POLICY "Public read for app-releases" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'app-releases');

CREATE POLICY "Admins can upload app-releases" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'app-releases' AND (public.is_admin() OR auth.role() = 'service_role'));

CREATE POLICY "Admins can update or delete app-releases" 
ON storage.objects
FOR ALL 
USING (bucket_id = 'app-releases' AND (public.is_admin() OR auth.role() = 'service_role'));

-- 3. Stored Procedure to fetch latest active version
CREATE OR REPLACE FUNCTION public.get_latest_app_version(p_platform VARCHAR DEFAULT 'android')
RETURNS TABLE (
    id UUID,
    platform VARCHAR,
    version_name VARCHAR,
    version_code INTEGER,
    apk_url TEXT,
    release_notes JSONB,
    is_mandatory BOOLEAN,
    minimum_supported_version VARCHAR,
    file_size_bytes BIGINT,
    checksum_sha256 VARCHAR,
    released_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        v.id,
        v.platform,
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

-- 4. Baseline Seed Record (Version 1.0.0, Code 1)
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
) VALUES (
    'android',
    '1.0.0',
    1,
    'https://oci-institute.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk',
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
)
ON CONFLICT (platform, version_code) DO NOTHING;
