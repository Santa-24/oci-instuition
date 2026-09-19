import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const DEFAULT_RELEASE = {
  latestVersion: '1.0.0',
  versionCode: 1,
  minimumSupportedVersion: '1.0.0',
  mandatory: false,
  apkUrl: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk',
  releaseNotes: [
    'Official production launch of the OCI mobile application',
    'Real-time integration with OCI examination CBT engine',
    'Interactive mock test series with countdown timers & instant scorecards',
    'Offline syllabus notes and previous-year question analysis downloads',
    'Direct announcements for batch class notices and examination alerts',
  ],
  fileSize: 36700160,
  checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  releasedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_versions')
      .select('*')
      .eq('platform', 'android')
      .eq('is_active', true)
      .order('version_code', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(DEFAULT_RELEASE);
    }

    const payload = {
      latestVersion: data.version_name || DEFAULT_RELEASE.latestVersion,
      versionCode: data.version_code || DEFAULT_RELEASE.versionCode,
      minimumSupportedVersion: data.minimum_supported_version || DEFAULT_RELEASE.minimumSupportedVersion,
      mandatory: Boolean(data.is_mandatory),
      apkUrl: data.apk_url || DEFAULT_RELEASE.apkUrl,
      releaseNotes: Array.isArray(data.release_notes) && data.release_notes.length > 0
        ? data.release_notes
        : DEFAULT_RELEASE.releaseNotes,
      fileSize: data.file_size_bytes || DEFAULT_RELEASE.fileSize,
      checksum: data.checksum_sha256 || DEFAULT_RELEASE.checksum,
      releasedAt: data.released_at || data.created_at || DEFAULT_RELEASE.releasedAt,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('[App Version API Error]:', err);
    return NextResponse.json(DEFAULT_RELEASE);
  }
}
