'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle, RefreshCw } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialHomepage = {
  hero: {
    eyebrow: 'ESTABLISHED 2017 • BHADRAK, ODISHA',
    heading: 'Your Goal. Our Guidance. Your Success.',
    subheading: 'Build Strong Concepts. Practice Consistently. Compete With Confidence.',
    description: 'Odisha Competitive Institute (OCI) is committed to providing quality, systematic, easy-to-understand and exam-oriented education while helping students build strong concepts, practice consistently and approach competitive examinations with confidence.',
    primaryCtaText: 'Start Your Preparation',
    primaryCtaLink: '/contact',
    secondaryCtaText: 'Explore Examinations',
    secondaryCtaLink: '/exams',
    appCtaText: 'Download OCI App',
    appCtaLink: '/app',
  },
  trustStrip: [
    { label: 'Established', text: '2017' },
    { label: 'Approach', text: 'Student-Focused Learning' },
    { label: 'Target', text: 'Competitive Exam Preparation' },
    { label: 'Location', text: 'Bhadrak, Odisha' },
    { label: 'System', text: 'Exam-Oriented Education' },
  ],
  aboutPreview: {
    heading: 'Built Around Student Success.',
    description: 'Odisha Competitive Institute (OCI) was founded on 17 January 2017 in Bhadrak with a vision to make competitive examination preparation structured, transparent, and genuinely student-centric.',
    ctaText: 'Discover OCI Story',
    ctaLink: '/about',
  },
  finalCta: {
    heading: 'Your Preparation Starts With One Decision.',
    subheading: 'Build Strong Concepts • Practice Consistently • Compete With Confidence',
    primaryBtnText: 'Start Your Preparation',
    secondaryBtnText: 'Download OCI App',
  },
  announcementBanner: 'Admissions Open for SSC, Odisha Govt & Railway Batches — Contact Campus Today!',
};

export default function HomepageCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialHomepage);

  useEffect(() => {
    async function loadData() {
      const res = await getCmsSection('homepage', initialHomepage);
      if (res.data) {
        setFormData(res.data);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveCmsSection('homepage', formData);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Homepage CMS Editor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage live hero copy, trust metrics, CTA buttons, and final CTA for the public website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Published to Live Site!' : isLoading ? 'Saving...' : 'Publish to Live Site'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Primary headline, eyebrow tag, value proposition, and CTA buttons</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Eyebrow Badge Text"
              value={formData.hero.eyebrow}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, eyebrow: e.target.value },
                })
              }
            />
            <Input
              label="Main Hero Heading"
              value={formData.hero.heading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, heading: e.target.value },
                })
              }
            />
            <Input
              label="Hero Subheading / Tagline"
              value={formData.hero.subheading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, subheading: e.target.value },
                })
              }
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Hero Description Paragraph</label>
              <textarea
                rows={3}
                value={formData.hero.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, description: e.target.value },
                  })
                }
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary CTA Text"
                value={formData.hero.primaryCtaText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, primaryCtaText: e.target.value },
                  })
                }
              />
              <Input
                label="Primary CTA URL"
                value={formData.hero.primaryCtaLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, primaryCtaLink: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Secondary CTA Text"
                value={formData.hero.secondaryCtaText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, secondaryCtaText: e.target.value },
                  })
                }
              />
              <Input
                label="Secondary CTA URL"
                value={formData.hero.secondaryCtaLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, secondaryCtaLink: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Announcement Ticker */}
        <Card>
          <CardHeader>
            <CardTitle>Top Announcement Banner</CardTitle>
            <CardDescription>Highlighted ticker banner for upcoming admissions and batch alerts</CardDescription>
          </CardHeader>
          <Input
            label="Announcement Message"
            value={formData.announcementBanner}
            onChange={(e) => setFormData({ ...formData, announcementBanner: e.target.value })}
          />
        </Card>

        {/* About Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Section Preview</CardTitle>
            <CardDescription>Heading and short introduction on the homepage</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Preview Heading"
              value={formData.aboutPreview.heading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  aboutPreview: { ...formData.aboutPreview, heading: e.target.value },
                })
              }
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Preview Paragraph</label>
              <textarea
                rows={3}
                value={formData.aboutPreview.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aboutPreview: { ...formData.aboutPreview, description: e.target.value },
                  })
                }
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </Card>

        {/* Final CTA Section */}
        <Card>
          <CardHeader>
            <CardTitle>Final Call-To-Action (Bottom Strip)</CardTitle>
            <CardDescription>Final conversion headline before footer</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Final CTA Heading"
              value={formData.finalCta.heading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  finalCta: { ...formData.finalCta, heading: e.target.value },
                })
              }
            />
            <Input
              label="Final CTA Subtitle"
              value={formData.finalCta.subheading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  finalCta: { ...formData.finalCta, subheading: e.target.value },
                })
              }
            />
          </div>
        </Card>
      </form>
    </div>
  );
}
