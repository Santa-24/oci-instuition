'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { supabase } from '@/lib/supabase/client';
import {
  Video,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  ArrowRight,
  Radio,
  Plus,
  CalendarCheck,
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [studentCount, setStudentCount] = useState(40);

  useEffect(() => {
    async function load() {
      const { data: cls } = await supabase.from('live_classes').select('*').limit(3);
      const { count } = await supabase.from('study_materials').select('*', { count: 'exact', head: true });
      if (cls) setClasses(cls);
      if (count !== null) setMaterialsCount(count);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 border border-emerald-500/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Faculty Command</span>
          <h1 className="text-2xl font-black text-white mt-1">Hello, Prof. Verma</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            You have 1 live interactive lecture scheduled today for SSC Pinnacle Morning Super 40.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/faculty/classes">
            <Button size="sm" variant="destructive" leftIcon={<Radio className="h-3.5 w-3.5 animate-pulse" />}>
              Start Live Room
            </Button>
          </Link>
          <Link href="/faculty/materials">
            <Button size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Upload Material
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Students"
          value={String(studentCount)}
          subtext="SSC Pinnacle Morning Batch"
          icon={<Users className="h-5 w-5" />}
          iconBgColor="bg-indigo-500/15 text-indigo-400"
          glow
        />
        <StatsCard
          title="Live Classes"
          value={`${classes.length} Scheduled`}
          subtext="This Academic Week"
          icon={<Video className="h-5 w-5" />}
          iconBgColor="bg-rose-500/15 text-rose-400"
        />
        <StatsCard
          title="Uploaded Materials"
          value={`${materialsCount || 12} Notes`}
          subtext="DPPs & Formula sheets"
          icon={<FileText className="h-5 w-5" />}
          iconBgColor="bg-amber-500/15 text-amber-400"
        />
        <StatsCard
          title="Active Batches"
          value="4 Batches"
          subtext="OPSC & SSC Focus"
          icon={<Users className="h-5 w-5" />}
          iconBgColor="bg-emerald-500/15 text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>My Teaching Schedule</CardTitle>
              <CardDescription>Live classroom sessions & timings</CardDescription>
            </div>
            <Link href="/faculty/classes">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Manage
              </Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-800/80">
            {classes.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{c.title}</p>
                  <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{c.subject} • {c.jitsi_room_name}</p>
                </div>
                <Link href="/faculty/classes">
                  <Button size="sm" variant="destructive">
                    Host Session
                  </Button>
                </Link>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="py-4 text-xs text-slate-500 text-center">No classes scheduled.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Direct faculty operational shortcuts</CardDescription>
            </div>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 p-4">
            <Link href="/faculty/classes" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col items-center text-center space-y-2">
              <Video className="h-6 w-6 text-emerald-400" />
              <span className="text-xs font-bold text-white">Live Classes</span>
              <span className="text-[10px] text-slate-400">Launch Jitsi sessions</span>
            </Link>
            <Link href="/faculty/materials" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col items-center text-center space-y-2">
              <FileText className="h-6 w-6 text-amber-400" />
              <span className="text-xs font-bold text-white">Upload Notes</span>
              <span className="text-[10px] text-slate-400">PDFs, DPPs & formulas</span>
            </Link>
            <Link href="/faculty/exams" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col items-center text-center space-y-2">
              <HelpCircle className="h-6 w-6 text-indigo-400" />
              <span className="text-xs font-bold text-white">Question Bank</span>
              <span className="text-[10px] text-slate-400">Add MCQs for test series</span>
            </Link>
            <Link href="/faculty/classes" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col items-center text-center space-y-2">
              <Video className="h-6 w-6 text-rose-400" />
              <span className="text-xs font-bold text-white">Schedule Class</span>
              <span className="text-[10px] text-slate-400">New Jitsi live session</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
