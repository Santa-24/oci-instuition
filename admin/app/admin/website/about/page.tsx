'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialAbout = {
  hero: {
    eyebrow: 'ABOUT OCI',
    heading: 'Built With Purpose. Focused On Your Success.',
    subheading: 'Odisha Competitive Institute (OCI) is a dedicated student-focused competitive examination preparation institute located in Bhadrak, Odisha.',
    establishedDate: '17 January 2017',
  },
  history: {
    title: 'Our Journey',
    milestones: [
      {
        year: '2017',
        date: '17 January 2017',
        title: 'Institute Established in Bhadrak',
        description: 'Odisha Competitive Institute begins its journey at Nayabazar, near Old Rajghat Bridge, Bhadrak, with a vision to provide quality, easy-to-understand, and exam-oriented education.',
      },
      {
        year: '2020-2024',
        date: 'Expansion Phase',
        title: 'Central & State Exam Preparation Hub',
        description: 'Expanded specialized coaching for SSC, OSSSC, OSSC, Banking, and Railway competitive exams.',
      },
    ],
  },
  philosophy: {
    title: 'How We Approach Learning',
    description: 'At OCI, we believe that competitive examination success is not born from shortcuts alone, but from a balanced synthesis of conceptual clarity, disciplined practice, and steady mentorship.',
    points: [
      'Building strong fundamentals before introducing complex problem-solving.',
      'Encouraging consistent daily practice over last-minute cramming.',
      'Providing smart shortcuts and time management strategies tailored to exam patterns.',
      'Maintaining a positive, friendly, and doubt-free learning environment.',
      'Fostering personal guidance for every student to help them reach their potential.',
    ],
  },
};

export default function AboutCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialAbout);

  useEffect(() => {
    async function loadData() {
      const res = await getCmsSection('about', initialAbout);
      if (res.data) {
        setData(res.data);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveCmsSection('about', data);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">About OCI — Content Editor</h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional history, milestones, and pedagogical philosophy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Saved to Database!' : isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About Hero Headline & Subtitle</CardTitle>
            <CardDescription>Story displayed at the top of the About page</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Eyebrow Tag"
              value={data.hero.eyebrow}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, eyebrow: e.target.value } })}
            />
            <Input
              label="Heading"
              value={data.hero.heading}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, heading: e.target.value } })}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Subheading / Introduction</label>
              <textarea
                rows={3}
                value={data.hero.subheading}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, subheading: e.target.value } })}
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <Input
              label="Established Date"
              value={data.hero.establishedDate}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, establishedDate: e.target.value } })}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Philosophy</CardTitle>
            <CardDescription>How OCI approaches student learning</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Philosophy Title"
              value={data.philosophy.title}
              onChange={(e) => setData({ ...data, philosophy: { ...data.philosophy, title: e.target.value } })}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Philosophy Description</label>
              <textarea
                rows={3}
                value={data.philosophy.description}
                onChange={(e) => setData({ ...data, philosophy: { ...data.philosophy, description: e.target.value } })}
                className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
