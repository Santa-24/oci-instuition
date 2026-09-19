'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [settings, setSettings] = useState({
    instituteName: 'Odisha Competitive Institute (OCI)',
    tagline: 'Excellence in JEE, NEET & Civil Services Mentorship',
    registrationNumber: 'OCI-OD-2012-REG-849',
    establishedYear: '2012',
    accreditation: 'Recognized by Higher Secondary Education Board, Odisha',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">General Institute Configuration</h1>
          <p className="text-xs text-slate-400 mt-1">Official institution names, government registration numbers, and branding.</p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
        >
          {isSaved ? 'Saved Settings!' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institute Legal Profile</CardTitle>
          <CardDescription>Displayed on fee receipts and official certificates</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Institute Legal Name"
              value={settings.instituteName}
              onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
            />
            <Input
              label="Registration Number"
              value={settings.registrationNumber}
              onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
            />
          </div>
          <Input
            label="Tagline / Slogan"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
          />
          <Input
            label="Accreditation / Affiliation Note"
            value={settings.accreditation}
            onChange={(e) => setSettings({ ...settings, accreditation: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}
