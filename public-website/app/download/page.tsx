import { PageHeader } from '@/components/page-header'
import { ApkDownloadTerminal } from '@/components/apk-download-terminal'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Download OCI Mobile App | Official Android APK',
  description:
    'Download the official OCI Android application APK directly. Fast, secure, verified CBT exam testing platform for competitive examination aspirants in Odisha.',
}

// Fallback baseline metadata if database is temporarily unreachable
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
  releasedAt: '2026-09-18T10:00:00.000Z',
}

async function getLatestRelease() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_versions')
      .select('*')
      .eq('platform', 'android')
      .eq('is_active', true)
      .order('version_code', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_RELEASE
    }

    return {
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
    }
  } catch (err) {
    console.warn('[Download Page Release Load Warning]: Falling back to baseline release.', err)
    return DEFAULT_RELEASE
  }
}

export default async function DownloadPage() {
  const release = await getLatestRelease()

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="OFFICIAL SOFTWARE DISTRIBUTION"
        title={`Download OCI Mobile App (v${release.latestVersion})`}
        description="Direct, high-speed binary distribution hosted on secure OCI infrastructure. Install directly on your Android phone without third-party app store delays."
        breadcrumbLabel="Download APK"
      />

      {/* 2. MAIN TERMINAL & INSTALLATION WALKTHROUGH */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ApkDownloadTerminal release={release} />
        </div>
      </section>
    </div>
  )
}
