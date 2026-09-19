'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

const initialVision = {
  english: 'To empower competitive exam aspirants with strong concepts, systematic guidance, and exam-oriented preparation—building confidence, discipline, and success in every student.',
  odia: 'ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ଦେଉଥିବା ଛାତ୍ରଛାତ୍ରୀମାନଙ୍କୁ ସୁଦୃଢ଼ ମୌଳିକ ଜ୍ଞାନ, କ୍ରମାନ୍ୱୟ ମାର୍ଗଦର୍ଶନ ଏବଂ ପରୀକ୍ଷା-ଉପଯୋଗୀ ପ୍ରସ୍ତୁତି ମାଧ୍ୟମରେ ସଶକ୍ତ କରିବା—ପ୍ରତ୍ୟେକ ଛାତ୍ରଛାତ୍ରୀଙ୍କଠାରେ ଆତ୍ମବିଶ୍ୱାସ, ଅନୁଶାସନ ଏବଂ ସଫଳତା ସୃଷ୍ଟି କରିବା।',
};

export default function VisionMissionCmsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vision, setVision] = useState(initialVision);

  useEffect(() => {
    async function loadData() {
      const res = await getCmsSection('vision', initialVision);
      if (res.data) {
        setVision(res.data);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveCmsSection('vision', vision);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Vision & Mission CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional bilingual vision (English & Odia).</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SYNCED WITH SUPABASE</Badge>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Saved Statements!' : isLoading ? 'Saving...' : 'Save Statements'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vision Statement (English)</CardTitle>
            <CardDescription>Displayed on About and Why OCI pages</CardDescription>
          </CardHeader>
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={vision.english}
              onChange={(e) => setVision({ ...vision, english: e.target.value })}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vision Statement in Odia (ଓଡ଼ିଆ ଭାଷାରେ ଲକ୍ଷ୍ୟ)</CardTitle>
            <CardDescription>Regional language authentic statement displayed with Odia typography</CardDescription>
          </CardHeader>
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={vision.odia}
              onChange={(e) => setVision({ ...vision, odia: e.target.value })}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-amber-300 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </Card>
      </form>
    </div>
  );
}
