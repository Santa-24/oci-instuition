import { Router } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { CacheManager } from '../config/redis.js';
import { NotificationService } from '../services/notification-service.js';

const router = Router();

const REDIS_KEY_LATEST_ANDROID = 'app:version:android';
const CACHE_TTL_SECONDS = 300; // 5 minutes

// Default baseline version metadata when database is starting or offline
const BASELINE_VERSION = {
  latestVersion: '1.0.0',
  versionCode: 1,
  minimumSupportedVersion: '1.0.0',
  mandatory: false,
  apkUrl: 'https://oci-institute.supabase.co/storage/v1/object/public/app-releases/android/OCI-v1.0.0.apk',
  releaseNotes: [
    'Official initial launch release of the OCI mobile application',
    'Real-time integration with OCI examination engine',
    'Interactive Computer-Based Test (CBT) mock tests with instant scorecards',
    'Live classroom streaming and interactive learning',
    'Offline study notes and syllabus downloads',
    'Direct push notifications for class notices and exam schedules'
  ],
  fileSize: 36700160,
  checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  releasedAt: new Date().toISOString()
};

/**
 * GET /api/app/version/android
 * Public endpoint consumed by mobile client and website to check the latest active version.
 * Utilizes Upstash Redis cache to minimize database query volume.
 */
router.get('/app/version/android', async (req, res) => {
  try {
    // 1. Check Redis Cache
    const cached = await CacheManager.get(REDIS_KEY_LATEST_ANDROID);
    if (cached) {
      return res.status(200).json({ ...cached, _cached: true });
    }

    // 2. Query Supabase
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(200).json(BASELINE_VERSION);
    }

    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', 'android')
      .eq('is_active', true)
      .order('version_code', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return res.status(200).json(BASELINE_VERSION);
    }

    const responsePayload = {
      latestVersion: data.version_name,
      versionCode: data.version_code,
      minimumSupportedVersion: data.minimum_supported_version,
      mandatory: data.is_mandatory,
      apkUrl: data.apk_url,
      releaseNotes: Array.isArray(data.release_notes) ? data.release_notes : [],
      fileSize: data.file_size_bytes,
      checksum: data.checksum_sha256,
      releasedAt: data.released_at,
    };

    // 3. Cache response in Redis
    await CacheManager.set(REDIS_KEY_LATEST_ANDROID, responsePayload, CACHE_TTL_SECONDS);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('[App Version Check Error]:', err.message);
    return res.status(200).json(BASELINE_VERSION);
  }
});

/**
 * GET /api/app/releases/android and GET /api/admin/app-releases
 * Returns complete release history for Android platform.
 */
router.get(['/app/releases/android', '/admin/app-releases'], async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(200).json({ releases: [BASELINE_VERSION] });
    }

    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', 'android')
      .order('version_code', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ releases: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/app-releases
 * Admin publication endpoint. Validates versionCode > current, stores metadata,
 * invalidates Redis cache, broadcasts FCM notification, and writes to audit_logs.
 */
router.post('/admin/app-releases', async (req, res) => {
  try {
    const {
      platform = 'android',
      versionName,
      versionCode,
      apkUrl,
      releaseNotes,
      isMandatory = false,
      minimumSupportedVersion = '1.0.0',
      fileSizeBytes,
      checksumSha256,
      publishedBy,
    } = req.body;

    // Validation 1: Required Fields
    if (!versionName || !versionCode || !apkUrl) {
      return res.status(400).json({
        error: 'versionName, versionCode, and apkUrl are strictly required.'
      });
    }

    const codeInt = parseInt(versionCode, 10);
    if (isNaN(codeInt) || codeInt <= 0) {
      return res.status(400).json({
        error: 'versionCode must be a positive integer.'
      });
    }

    // Validation 2: Ensure versionCode is strictly greater than current active release
    let currentLatestCode = BASELINE_VERSION.versionCode;
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: latestRelease } = await supabase
        .from('app_versions')
        .select('version_code, version_name')
        .eq('platform', platform)
        .order('version_code', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRelease) {
        currentLatestCode = latestRelease.version_code;
      }
    }

    if (codeInt <= currentLatestCode) {
      return res.status(400).json({
        error: `Safety check failed: versionCode (${codeInt}) must be strictly greater than current latest versionCode (${currentLatestCode}).`
      });
    }

    if (supabase) {

      // Insert new release
      const releaseNotesArray = Array.isArray(releaseNotes)
        ? releaseNotes
        : typeof releaseNotes === 'string'
          ? releaseNotes.split('\n').filter(Boolean)
          : [];

      const { data: created, error: insertError } = await supabase
        .from('app_versions')
        .insert({
          platform,
          version_name: versionName,
          version_code: codeInt,
          apk_url: apkUrl,
          release_notes: releaseNotesArray,
          is_mandatory: Boolean(isMandatory),
          minimum_supported_version: minimumSupportedVersion,
          file_size_bytes: fileSizeBytes || null,
          checksum_sha256: checksumSha256 || null,
          is_active: true,
          published_by: publishedBy || null,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to publish release: ${insertError.message}`);
      }

      // Invalidate Redis cache
      await CacheManager.del(REDIS_KEY_LATEST_ANDROID);

      // Audit Log
      try {
        await supabase.from('audit_logs').insert({
          action: 'APP_RELEASE_PUBLISHED',
          entity_type: 'app_versions',
          entity_id: created.id,
          performed_by: publishedBy || null,
          details: {
            version_name: versionName,
            version_code: codeInt,
            is_mandatory: isMandatory,
          },
        });
      } catch (auditErr) {
        console.warn('[Audit Log Warning]:', auditErr.message);
      }

      // Broadcast FCM Push Notification to all users
      try {
        await NotificationService.broadcastNotification({
          title: `OCI App Update: v${versionName}`,
          body: isMandatory
            ? `Important update: OCI v${versionName} is required to continue using the application.`
            : `OCI v${versionName} is now available with new features and performance improvements.`,
          targetType: 'all',
          data: {
            type: 'app_update',
            versionName,
            versionCode: String(codeInt),
            mandatory: String(isMandatory),
          },
        });
      } catch (fcmErr) {
        console.warn('[FCM Release Broadcast Notice]:', fcmErr.message);
      }

      return res.status(201).json({ success: true, release: created });
    }

    // Local fallback when Supabase is offline
    await CacheManager.del(REDIS_KEY_LATEST_ANDROID);
    return res.status(201).json({
      success: true,
      release: {
        id: `rel_mock_${Date.now()}`,
        version_name: versionName,
        version_code: codeInt,
        apk_url: apkUrl,
        is_mandatory: isMandatory,
        mode: 'local_fallback',
      },
    });
  } catch (err) {
    console.error('[Publish App Release Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/app-releases/:id
 * Toggles active status of a release (used for rollbacks).
 */
router.patch('/admin/app-releases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, performedBy } = req.body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      await CacheManager.del(REDIS_KEY_LATEST_ANDROID);
      return res.status(200).json({ success: true, message: 'Release status updated (local mode)' });
    }

    const { data: updated, error } = await supabase
      .from('app_versions')
      .update({ is_active: Boolean(isActive) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache immediately on rollback
    await CacheManager.del(REDIS_KEY_LATEST_ANDROID);

    // Record audit log
    try {
      await supabase.from('audit_logs').insert({
        action: isActive ? 'APP_RELEASE_ACTIVATED' : 'APP_RELEASE_ROLLEDBACK',
        entity_type: 'app_versions',
        entity_id: id,
        performed_by: performedBy || null,
        details: { release_id: id, is_active: isActive },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, release: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
