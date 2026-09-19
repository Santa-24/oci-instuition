'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

      const { data, error } = await supabase.storage
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

    // Section 25 Safety check: versionCode must be strictly greater than current
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">App Release Manager</h1>
          <p className="text-sm text-slate-500">
            Publish official Android APK binaries, configure in-app automatic update rules, and manage rollbacks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchReleases} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setFormVersionCode(String(currentMaxCode + 1));
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Publish New Release
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Active Version</span>
            <Badge variant="success">Production</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              v{latestActiveRelease?.version_name || '2.0.0'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              (Build {latestActiveRelease?.version_code || 2})
            </span>
          </div>
          <p className="text-xs text-slate-500">Package: com.oci.institute</p>
        </Card>

        <Card className="p-4 space-y-2 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Releases</span>
            <FileCode className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{releases.length}</span>
          <p className="text-xs text-slate-500">Maintained in Supabase Storage</p>
        </Card>

        <Card className="p-4 space-y-2 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Update Policy</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-800">
            {latestActiveRelease?.is_mandatory ? 'Mandatory Barrier' : 'Flexible (Normal)'}
          </div>
          <p className="text-xs text-slate-500">Min Supported: v{latestActiveRelease?.minimum_supported_version || '1.0.0'}</p>
        </Card>

        <Card className="p-4 space-y-2 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">APK Distribution</span>
            <Download className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-sm font-semibold truncate text-slate-800">
            {latestActiveRelease?.apk_url ? (
              <a
                href={latestActiveRelease.apk_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Download Active APK</span>
              </a>
            ) : (
              'No APK uploaded'
            )}
          </div>
          <p className="text-xs text-slate-500">Public CDN via Supabase</p>
        </Card>
      </div>

      {/* Releases Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Release History & Version Governance
          </h3>
          <span className="text-xs text-slate-500">
            Monotonically increasing versionCode enforced
          </span>
        </div>

        <Table>
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
            {releases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  No app releases recorded. Click "Publish New Release" to create one.
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release) => (
                <TableRow key={release.id || release.version_code}>
                  <TableCell className="font-bold text-slate-900">
                    v{release.version_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {release.version_code}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-medium text-slate-700">
                    {release.platform}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {Array.isArray(release.release_notes)
                      ? release.release_notes.join(' • ')
                      : 'Standard update'}
                  </TableCell>
                  <TableCell>
                    {release.is_mandatory ? (
                      <Badge variant="destructive">Mandatory</Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {release.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="outline">Rolled Back</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {release.apk_url && (
                      <a
                        href={release.apk_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold p-1"
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
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Publish Release Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official App Release"
      >
        <div className="space-y-4 text-slate-800">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Version Name *
              </label>
              <Input
                placeholder="e.g. 2.1.0"
                value={formVersionName}
                onChange={(e) => setFormVersionName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Supported Version
            </label>
            <Input
              placeholder="1.0.0"
              value={formMinVersion}
              onChange={(e) => setFormMinVersion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload APK Binary to Storage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".apk"
                onChange={handleFileUpload}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {isUploadingApk && <span className="text-xs text-blue-600 animate-pulse">Uploading...</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              APK Public Download URL *
            </label>
            <Input
              placeholder="https://..."
              value={formApkUrl}
              onChange={(e) => setFormApkUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Release Notes (one point per line)
            </label>
            <textarea
              rows={3}
              className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="mandatoryToggle" className="text-xs font-medium text-slate-700">
              Mark as Mandatory Update (blocks app usage until updated)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePublishRelease}
              disabled={isSubmitting || isUploadingApk}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Release'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
