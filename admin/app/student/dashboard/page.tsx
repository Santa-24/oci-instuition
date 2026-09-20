'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { supabase } from '@/lib/supabase/client';
import {
  Video,
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [studentName, setStudentName] = useState('Student Aspirant');

  useEffect(() => {
    async function loadStudentData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.full_name) {
            setStudentName(profile.full_name);
          }
        }

        const [liveRes, matRes, examRes] = await Promise.all([
          supabase.from('live_classes').select('*').limit(3),
          supabase.from('study_materials').select('*').limit(3),
          supabase.from('exams').select('*').eq('is_published', true).limit(3),
        ]);
        if (liveRes.data) setLiveClasses(liveRes.data);
        if (matRes.data) setMaterials(matRes.data);
        if (examRes.data) setExams(examRes.data);
      } catch (err) {
        console.warn('[Student Dashboard Load Error]:', err);
      }
    }
    loadStudentData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/50 border border-indigo-500/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Aspirant Dashboard</span>
          <h1 className="text-2xl font-black text-white mt-1">Welcome, {studentName}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {liveClasses.length > 0
              ? `You have ${liveClasses.length} live interactive class session(s) available.`
              : 'Your assigned classes and study materials will appear here once scheduled by the institute.'}
          </p>
        </div>
        {liveClasses.length > 0 && (
          <Link href="/student/classes">
            <Button size="sm" variant="destructive" leftIcon={<Radio className="h-3.5 w-3.5 animate-pulse" />}>
              Join Live Class
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Scheduled Classes"
          value={`${liveClasses.length} Sessions`}
          subtext="Interactive Classroom"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBgColor="bg-emerald-500/15 text-emerald-400"
          glow
        />
        <StatsCard
          title="Available Exams"
          value={`${exams.length} Tests`}
          subtext="Active Computer-Based Tests"
          icon={<Award className="h-5 w-5" />}
          iconBgColor="bg-indigo-500/15 text-indigo-400"
        />
        <StatsCard
          title="Curriculum Subjects"
          value="Academic Program"
          subtext="Enrolled Course Modules"
          icon={<BookOpen className="h-5 w-5" />}
          iconBgColor="bg-amber-500/15 text-amber-400"
        />
        <StatsCard
          title="Study Notes"
          value={`${materials.length} Documents`}
          subtext="High-Yield Notes & DPPs"
          icon={<FileText className="h-5 w-5" />}
          iconBgColor="bg-blue-500/15 text-blue-400"
        />
      </div>

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Live Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Today & Upcoming Live Lectures</CardTitle>
              <CardDescription>Direct interactive classrooms via Jitsi video</CardDescription>
            </div>
            <Link href="/student/classes">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                All Classes
              </Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-800/80">
            {liveClasses.map((cls) => (
              <div key={cls.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{cls.title}</p>
                  <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{cls.subject} • Today</p>
                </div>
                <Link href="/student/classes">
                  <Button size="sm" variant={cls.status === 'live' ? 'destructive' : 'outline'}>
                    {cls.status === 'live' ? 'Join Now' : 'Scheduled'}
                  </Button>
                </Link>
              </div>
            ))}
            {liveClasses.length === 0 && (
              <div className="py-8 text-xs text-slate-500 text-center">No active lectures right now.</div>
            )}
          </div>
        </Card>

        {/* Recent Study Materials & Notes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Study Materials & DPPs</CardTitle>
              <CardDescription>Curated high-yield notes and question sheets</CardDescription>
            </div>
            <Link href="/student/materials">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                All Materials
              </Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-800/80">
            {materials.map((mat) => (
              <div key={mat.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{mat.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{mat.subject} • {mat.type || 'PDF Document'}</p>
                </div>
                <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </a>
              </div>
            ))}
            {materials.length === 0 && (
              <div className="py-8 text-xs text-slate-500 text-center">No study materials uploaded yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
