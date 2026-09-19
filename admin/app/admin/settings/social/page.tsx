'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, Share2 } from 'lucide-react';

export default function SocialSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [socials, setSocials] = useState({
    youtube: 'https://youtube.com/@oci_odisha_official',
    telegram: 'https://t.me/oci_competitive_materials',
    instagram: 'https://instagram.com/oci_institute_official',
    facebook: 'https://facebook.com/oci.odisha.competitive',
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
          <h1 className="text-xl font-extrabold text-white tracking-tight">Social Media Channels</h1>
          <p className="text-xs text-slate-400 mt-1">Manage official Telegram channel, YouTube live stream hub, and social links.</p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
        >
          {isSaved ? 'Saved Social Links!' : 'Save Social Links'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span>Official Social URLs</span>
          </CardTitle>
          <CardDescription>Rendered in website headers, footers, and app drawer</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="YouTube Channel URL"
            value={socials.youtube}
            onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
          />
          <Input
            label="Telegram Discussion & DPP Channel"
            value={socials.telegram}
            onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
          />
          <Input
            label="Instagram Profile"
            value={socials.instagram}
            onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
          />
          <Input
            label="Facebook Page"
            value={socials.facebook}
            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}
