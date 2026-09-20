'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Smartphone,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

interface AppRelease {
  id: string;
  platform: string;
  version_name: string;
  version_code: number;
  apk_url: string;
  release_notes: string[];
  is_mandatory: boolean;
  minimum_supported_version: string;
  file_size_bytes?: number;
  checksum_sha256?: string;
  is_active: boolean;
  released_at: string;
}

export default function AppReleasesAdminPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formVersionName, setFormVersionName] = useState('');
  const [formVersionCode, setFormVersionCode] = useState('');
  const [formApkUrl, setFormApkUrl] = useState('');
  const [formMinVersion, setFormMinVersion] = useState('1.0.0');
  const [formReleaseNotes, setFormReleaseNotes] = useState('');
  const [formIsMandatory, setFormIsMandatory] = useState(false);
  const [isUploadingApk, setIsUploadingApk] = useState(false);

  const fetchReleases = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .eq('platform', 'android')
        .order('version_code', { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (e: any) {
      console.warn('Direct Supabase fetch fallback to API endpoint:', e.message);
      try {
        const res = await fetch('/api/admin/app-releases');
        if (res.ok) {
          const json = await res.json();
          setReleases(json.releases || []);
        }
      } catch (err) {
        console.error('Failed to load releases:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const latestActiveRelease = releases.find((r) => r.is_active) || releases[0];
  const currentMaxCode = releases.reduce((max, r) => Math.max(max, r.version_code), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      alert('Please select a valid Android APK binary (.apk)');
      return;
    }

    setIsUploadingApk(true);
    try {
      const supabase = getSupabaseClient();
      const cleanFileName = `android/releases/OCI-v${formVersionName || 'release'}-${Date.now()}.apk`;

      const { error } = await supabase.storage
        .from('app-releases')
        .upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('app-releases')
        .getPublicUrl(cleanFileName);

      setFormApkUrl(publicData.publicUrl);
    } catch (err: any) {
      alert(`Storage upload notice: ${err.message}. You can also enter a direct APK URL manually.`);
    } finally {
      setIsUploadingApk(false);
    }
  };

  const handlePublishRelease = async () => {
    setErrorMsg(null);
    const codeInt = parseInt(formVersionCode, 10);

    if (isNaN(codeInt) || codeInt <= currentMaxCode) {
      setErrorMsg(`Safety Check Failed: Version Code must be strictly greater than the current latest code (${currentMaxCode}).`);
      return;
    }

    if (!formVersionName.trim() || !formApkUrl.trim()) {
      setErrorMsg('Version Name and APK URL are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const notesArray = formReleaseNotes
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch('/api/admin/app-releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'android',
          versionName: formVersionName.trim(),
          versionCode: codeInt,
          apkUrl: formApkUrl.trim(),
          releaseNotes: notesArray.length > 0 ? notesArray : ['Performance improvements and bug fixes'],
          isMandatory: formIsMandatory,
          minimumSupportedVersion: formMinVersion.trim() || '1.0.0',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish release');
      }

      await fetchReleases();
      setIsModalOpen(false);
      setFormVersionName('');
      setFormVersionCode('');
      setFormApkUrl('');
      setFormReleaseNotes('');
      setFormIsMandatory(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRollback = async (release: AppRelease) => {
    const action = release.is_active ? 'roll back (deactivate)' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} release v${release.version_name} (Build ${release.version_code})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/app-releases/${release.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !release.is_active }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update release status');
      }

      await fetchReleases();
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Android App Releases & Versions"
        description="Publish official Android APK binaries, configure in-app automatic update rules, and manage rollback governance."
        statusPill={<StatusBadge status="live" label="APK GOVERNANCE" size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchReleases}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Sync Releases
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormVersionCode(String(currentMaxCode + 1));
                setErrorMsg(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Publish New Release
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Active Version</span>
            <StatusBadge status="live" label="Production" size="sm" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              v{latestActiveRelease?.version_name || '2.0.0'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              (Build {latestActiveRelease?.version_code || 2})
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Package: com.oci.institute</p>
        </Card>

        <Card className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Releases</span>
            <FileCode className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {releases.length}
          </span>
          <p className="text-[11px] text-slate-500">Maintained in Supabase Storage</p>
        </Card>

        <Card className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Update Policy</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {latestActiveRelease?.is_mandatory ? 'Mandatory Barrier' : 'Flexible (Normal)'}
          </div>
          <p className="text-[11px] text-slate-500">Min: v{latestActiveRelease?.minimum_supported_version || '1.0.0'}</p>
        </Card>

        <Card className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">APK Distribution</span>
            <Download className="h-4 w-4 text-primary-500" />
          </div>
          <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
            {latestActiveRelease?.apk_url ? (
              <a
                href={latestActiveRelease.apk_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Download APK Binary</span>
              </a>
            ) : (
              'No APK uploaded'
            )}
          </div>
          <p className="text-[11px] text-slate-500">Public CDN via Supabase</p>
        </Card>
      </div>

      {/* Releases Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Release History &amp; Version Governance
          </h3>
          <span className="text-[11px] text-slate-500">
            Monotonically increasing versionCode enforced
          </span>
        </div>

        {releases.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Build Code</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Release Notes</TableHead>
                <TableHead>Update Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow key={release.id || release.version_code}>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                    v{release.version_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {release.version_code}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-medium text-slate-700 dark:text-slate-300">
                    {release.platform}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {Array.isArray(release.release_notes)
                      ? release.release_notes.join(' • ')
                      : 'Standard update'}
                  </TableCell>
                  <TableCell>
                    {release.is_mandatory ? (
                      <StatusBadge status="urgent" label="MANDATORY" size="sm" />
                    ) : (
                      <StatusBadge status="draft" label="NORMAL" size="sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    {release.is_active ? (
                      <StatusBadge status="live" label="ACTIVE" size="sm" />
                    ) : (
                      <StatusBadge status="inactive" label="ROLLED BACK" size="sm" />
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {release.apk_url && (
                      <a
                        href={release.apk_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold p-1"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        APK
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRollback(release)}
                      title={release.is_active ? 'Rollback / Deactivate' : 'Reactivate'}
                      className="text-slate-400 hover:text-amber-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={Smartphone}
            title="No App Releases Recorded"
            description="Publish Android APK binaries to manage updates for OCI student mobile devices."
            actionLabel="Publish First Release"
            onAction={() => {
              setFormVersionCode(String(currentMaxCode + 1));
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading releases from database...</span>
          </div>
        )}
      </Card>

      {/* Publish Release Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official App Release"
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Version Name *
              </label>
              <Input
                placeholder="e.g. 2.1.0"
                value={formVersionName}
                onChange={(e) => setFormVersionName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Version Code * (must be &gt; {currentMaxCode})
              </label>
              <Input
                type="number"
                placeholder={String(currentMaxCode + 1)}
                value={formVersionCode}
                onChange={(e) => setFormVersionCode(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Minimum Supported Version
            </label>
            <Input
              placeholder="1.0.0"
              value={formMinVersion}
              onChange={(e) => setFormMinVersion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Upload APK Binary to Storage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".apk"
                onChange={handleFileUpload}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {isUploadingApk && <span className="text-xs text-primary-600 animate-pulse">Uploading...</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              APK Public Download URL *
            </label>
            <Input
              placeholder="https://..."
              value={formApkUrl}
              onChange={(e) => setFormApkUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Release Notes (one point per line)
            </label>
            <textarea
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="• New live classroom player&#10;• Offline study notes download&#10;• Performance optimizations"
              value={formReleaseNotes}
              onChange={(e) => setFormReleaseNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="mandatoryToggle"
              checked={formIsMandatory}
              onChange={(e) => setFormIsMandatory(e.target.checked)}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="mandatoryToggle" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Mark as Mandatory Update (blocks older app builds until updated)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePublishRelease}
              disabled={isSubmitting || isUploadingApk}
              isLoading={isSubmitting}
            >
              Publish Release
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
