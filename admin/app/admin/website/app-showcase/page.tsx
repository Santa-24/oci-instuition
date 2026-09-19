'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle, Smartphone } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialAppSettings = {
  androidUrl: 'https://play.google.com/store/apps/details?id=com.oci.mobile',
  iosUrl: 'https://apps.apple.com/app/oci-learning/id123456789',
  qrCodeText: 'Scan QR to download the OCI Mobile App on Android & iOS',
  features: [
    { title: 'Live & Recorded Video Classes', description: 'Attend live classes with chat or watch high-definition recordings at your own speed.' },
    { title: 'Computer-Based Mock Test Series', description: 'Simulate exact exam interface with negative marking and instant detailed solutions.' },
    { title: 'Digital Notes & Daily Practice Papers', description: 'Download formula sheets, chapter summaries, and graded worksheets.' },
    { title: 'All India Rank & Performance Analytics', description: 'Track percentile trends, speed, and accuracy across all test series.' },
  ],
};

export default function AppShowcaseCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appData, setAppData] = useState(initialAppSettings);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('appSettings', initialAppSettings);
      if (res.data) {
        setAppData(res.data);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveCmsSection('appSettings', appData);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Mobile App Showcase CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Play Store/App Store download links, features, and QR settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Saved App Settings!' : isLoading ? 'Saving...' : 'Publish App Settings'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-indigo-400" />
              <span>Store Links & QR Code Configuration</span>
            </CardTitle>
            <CardDescription>Download destinations shown on the website and app showcase page</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Google Play Store URL"
              value={appData.androidUrl}
              onChange={(e) => setAppData({ ...appData, androidUrl: e.target.value })}
            />
            <Input
              label="Apple App Store URL"
              value={appData.iosUrl}
              onChange={(e) => setAppData({ ...appData, iosUrl: e.target.value })}
            />
            <Input
              label="QR Code Caption Text"
              value={appData.qrCodeText}
              onChange={(e) => setAppData({ ...appData, qrCodeText: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highlighted App Features</CardTitle>
            <CardDescription>Key benefits displayed in feature cards on /app</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {appData.features.map((feat, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 space-y-3">
                <Input
                  label={`Feature ${idx + 1} Title`}
                  value={feat.title}
                  onChange={(e) => {
                    const next = [...appData.features];
                    next[idx].title = e.target.value;
                    setAppData({ ...appData, features: next });
                  }}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Feature Description</label>
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={(e) => {
                      const next = [...appData.features];
                      next[idx].description = e.target.value;
                      setAppData({ ...appData, features: next });
                    }}
                    className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </form>
    </div>
  );
}
