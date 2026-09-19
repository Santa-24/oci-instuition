'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle, Search } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialSeo = {
  siteTitle: 'Odisha Competitive Institute | Your Success, Our Tradition',
  siteDescription: 'Odisha Competitive Institute (OCI) in Bhadrak provides quality, systematic coaching for SSC, Odisha State Govt, Railway, Banking, and Teaching competitive examinations.',
  canonicalDomain: 'https://oci-institute.edu',
  ogImageUrl: '/oci-logo.png',
  keywords: 'Odisha Competitive Institute, OCI Bhadrak, SSC Coaching Odisha, OSSSC Exam Prep Bhadrak, Railway Prep Odisha, Banking Coaching Bhadrak',
};

export default function SeoSettingsCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seo, setSeo] = useState(initialSeo);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('seo', initialSeo);
      if (res.data) {
        setSeo({
          ...initialSeo,
          ...res.data,
          keywords: Array.isArray(res.data.keywords) ? res.data.keywords.join(', ') : (res.data.keywords || initialSeo.keywords),
        });
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      ...seo,
      keywords: typeof seo.keywords === 'string' ? seo.keywords.split(',').map((s) => s.trim()) : seo.keywords,
    };
    await saveCmsSection('seo', payload);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Search Engine Optimization (SEO) CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage global meta tags, OpenGraph social previews, and index settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Saved Meta Settings!' : isLoading ? 'Saving...' : 'Save SEO Tags'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span>Global Meta Tags & OpenGraph</span>
            </CardTitle>
            <CardDescription>Primary search engine crawl settings for OCI domain</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Global Browser Title Tag"
              value={seo.siteTitle}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Meta Description</label>
              <textarea
                rows={3}
                value={seo.siteDescription}
                onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <Input
              label="Canonical Production Domain"
              value={seo.canonicalDomain}
              onChange={(e) => setSeo({ ...seo, canonicalDomain: e.target.value })}
            />
            <Input
              label="Social Share Image (OG Banner)"
              value={seo.ogImageUrl}
              onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Meta Keywords (Comma separated)</label>
              <textarea
                rows={2}
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
