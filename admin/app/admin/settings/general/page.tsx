'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { AcademicService } from '@/lib/services/academic-service';
import { Save, CheckCircle, RefreshCw, Landmark, ShieldCheck } from 'lucide-react';

const DEFAULT_SETTINGS = {
  instituteName: 'Odisha Competitive Institute (OCI)',
  tagline: 'Premier Mentorship for Central Govt (SSC), State Recruitment (OSSC), Railways & Banking Exams',
  registrationNumber: 'OCI-BHK-2017-REG-489',
  establishedYear: '2017',
  accreditation: 'Registered Under Odisha Educational Societies Trust Act',
  campusCity: 'Nayabazar, Bhadrak, Odisha — 756100',
};

export default function GeneralSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await AcademicService.getSettings('settings_general', DEFAULT_SETTINGS);
        if (data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (err) {
        console.error('Failed to load general settings:', err);
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
      await AcademicService.saveSettings('settings_general', settings);
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
        title="General Institute Configuration"
        description="Official legal name, registration numbers, institutional founding year, and branding profile."
        statusPill={<StatusBadge status="live" label="DATABASE SYNCED" size="sm" />}
        actions={
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Settings Persisted!' : 'Save Configuration'}
          </Button>
        }
      />

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
        <CardHeader className="px-0 pt-0 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <CardTitle>Institute Legal &amp; Corporate Identity</CardTitle>
          </div>
          <CardDescription>
            Rendered on student certificates, official notifications, and public verification records
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Institute Legal Name"
              value={settings.instituteName}
              onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
              required
            />
            <Input
              label="Govt Registration Number"
              value={settings.registrationNumber}
              onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
              required
            />
          </div>

          <Input
            label="Institutional Tagline / Academic Mission"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Year Established"
              value={settings.establishedYear}
              onChange={(e) => setSettings({ ...settings, establishedYear: e.target.value })}
            />
            <Input
              label="Campus Location"
              value={settings.campusCity}
              onChange={(e) => setSettings({ ...settings, campusCity: e.target.value })}
            />
          </div>

          <Input
            label="Accreditation / Regulatory Status"
            value={settings.accreditation}
            onChange={(e) => setSettings({ ...settings, accreditation: e.target.value })}
          />
        </form>
      </Card>
    </div>
  );
}
