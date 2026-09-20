'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { AcademicService } from '@/lib/services/academic-service';
import { Save, CheckCircle, Share2, Youtube, Send, Instagram, Facebook } from 'lucide-react';

const DEFAULT_SOCIALS = {
  youtube: 'https://youtube.com/@oci_odisha_official',
  telegram: 'https://t.me/oci_competitive_study',
  instagram: 'https://instagram.com/oci_institute_bhadrak',
  facebook: 'https://facebook.com/oci.bhadrak',
};

export default function SocialSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await AcademicService.getSettings('settings_social', DEFAULT_SOCIALS);
        if (data) {
          setSocials({ ...DEFAULT_SOCIALS, ...data });
        }
      } catch (err) {
        console.error('Failed to load social settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AcademicService.saveSettings('settings_social', socials);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Channels &amp; Community Links"
        description="Official Telegram DPP discussion groups, YouTube livestream hub, and social broadcast channels."
        statusPill={<StatusBadge status="live" label="DATABASE SYNCED" size="sm" />}
        actions={
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Social Links Saved!' : 'Save Social Channels'}
          </Button>
        }
      />

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
        <CardHeader className="px-0 pt-0 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <CardTitle>Official Broadcast &amp; Study Group URLs</CardTitle>
          </div>
          <CardDescription>Rendered in website headers, footers, and student mobile app navigation drawer</CardDescription>
        </CardHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="YouTube Channel URL (Live Class Feeds)"
              value={socials.youtube}
              onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
            />
            <Input
              label="Telegram Discussion & Daily DPP Channel"
              value={socials.telegram}
              onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instagram Profile"
              value={socials.instagram}
              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
            />
            <Input
              label="Facebook Community Page"
              value={socials.facebook}
              onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
