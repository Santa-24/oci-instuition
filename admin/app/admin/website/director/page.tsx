'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialDirector = {
  title: 'A Message From Our Director',
  salutation: 'Dear Students and Parents,',
  content: [
    'Odisha Competitive Institute (OCI) was founded with a singular focus: to make quality competitive exam preparation structured, transparent, and genuinely student-centric.',
    'We understand that competitive examinations test not only your knowledge, but also your speed, accuracy, and mental endurance. Our faculty and academic systems are designed to support you at every stage of this journey.',
  ],
};

export default function DirectorMessageCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [director, setDirector] = useState(initialDirector);

  useEffect(() => {
    async function loadData() {
      const res = await getCmsSection('directorMessage', initialDirector);
      if (res.data) {
        setDirector(res.data);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveCmsSection('directorMessage', director);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Director’s Message CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage director address, salutation, and message paragraphs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Saved Message!' : isLoading ? 'Saving...' : 'Save Message'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Director Greeting & Salutation</CardTitle>
            <CardDescription>Header line and opening address</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Section Title"
              value={director.title}
              onChange={(e) => setDirector({ ...director, title: e.target.value })}
            />
            <Input
              label="Salutation"
              value={director.salutation}
              onChange={(e) => setDirector({ ...director, salutation: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Paragraphs</CardTitle>
            <CardDescription>Primary address copy shown on About page</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {director.content.map((paragraph, idx) => (
              <div key={idx} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Paragraph {idx + 1}</label>
                <textarea
                  rows={3}
                  value={paragraph}
                  onChange={(e) => {
                    const nextContent = [...director.content];
                    nextContent[idx] = e.target.value;
                    setDirector({ ...director, content: nextContent });
                  }}
                  className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            ))}
          </div>
        </Card>
      </form>
    </div>
  );
}
