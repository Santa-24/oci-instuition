'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Video,
  BookOpen,
  HelpCircle,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExamParticipationChart, BatchProgressChart } from '@/components/charts/analytics-charts';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam, EnquiryLead, Batch } from '@/lib/types/admin';

export default function AdminDashboardPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [liveClassCount, setLiveClassCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [metricData, batchList] = await Promise.all([
          AcademicService.getDashboardMetrics(),
          AcademicService.getBatches(),
        ]);
        if (metricData.success && metricData.stats) {
          setStudentCount(metricData.stats.studentsCount);
          setBatchCount(metricData.stats.batchesCount);
          setCourseCount(metricData.stats.coursesCount);
          setEnquiryCount(metricData.stats.enquiriesCount);
          setLiveClassCount(metricData.stats.liveClassesToday);
          setEnquiries(metricData.recentEnquiries || []);
          setExams(metricData.exams || []);
        }
        setBatches(batchList || []);
      } catch (err) {
        console.warn('[Dashboard Load Error]:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalAttempts = exams.reduce((acc, e) => acc + (e.attemptCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Title & Live Status Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Operational Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time overview of admissions, live classrooms, academic progress, and student performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">SUPABASE LIVE</Badge>
          <Link href="/admin/live-classes">
            <Button size="sm" variant="destructive" leftIcon={<Radio className="h-3.5 w-3.5 animate-pulse" />}>
              Monitor {liveClassCount > 0 ? `${liveClassCount} Live` : 'Live Classes'}
            </Button>
          </Link>
          <Link href="/admin/mock-exams">
            <Button size="sm" variant="secondary" leftIcon={<HelpCircle className="h-3.5 w-3.5" />}>
              Schedule Mock Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Batches"
          value={`${batchCount} Batches`}
          subtext="Ongoing in Bhadrak campus"
          trend={{ value: 'Live DB', isPositive: true }}
          icon={<BookOpen className="h-5 w-5" />}
          iconBgColor="bg-emerald-500/15 text-emerald-400"
          glow
        />
        <StatsCard
          title="Academic Courses"
          value={`${courseCount} Programs`}
          subtext="SSC, State Govt, Railway, Banking"
          trend={{ value: 'Active Curriculum', isPositive: true }}
          icon={<GraduationCap className="h-5 w-5" />}
          iconBgColor="bg-amber-500/15 text-amber-400"
        />
        <StatsCard
          title="Enrolled Students"
          value={String(studentCount)}
          subtext="Verified admission enrollments"
          trend={{ value: 'Live Supabase DB', isPositive: true }}
          icon={<Users className="h-5 w-5" />}
          iconBgColor="bg-indigo-500/15 text-indigo-400"
        />
        <StatsCard
          title="Website Enquiries"
          value={`${enquiryCount} Leads`}
          subtext="Direct student applicants"
          icon={<ArrowUpRight className="h-5 w-5" />}
          iconBgColor="bg-sky-500/15 text-sky-400"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExamParticipationChart totalAttempts={totalAttempts} activeExamsCount={exams.length} />
        </div>
        <div>
          <BatchProgressChart batches={batches} />
        </div>
      </div>

      {/* Bottom Operational Grids: Active Mock Tests & New Website Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Mock Tests & Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Mock Examinations</CardTitle>
              <CardDescription>Published tests & student participation</CardDescription>
            </div>
            <Link href="/admin/mock-exams">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                View All Tests
              </Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-800/80">
            {exams.slice(0, 4).map((exam) => (
              <div key={exam.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{exam.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exam.courseName} • {exam.durationMinutes} mins • {exam.totalQuestions} questions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-white">{exam.attemptCount || 0} Attempts</p>
                  <Badge variant={exam.isPublished ? 'success' : 'outline'} className="mt-0.5">
                    {exam.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </Badge>
                </div>
              </div>
            ))}
            {exams.length === 0 && (
              <p className="py-4 text-xs text-slate-500 text-center">No examinations scheduled yet.</p>
            )}
          </div>
        </Card>

        {/* Website & App Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Admission Enquiries</CardTitle>
              <CardDescription>Website and App contact leads</CardDescription>
            </div>
            <Link href="/admin/enquiries">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                Manage Leads
              </Button>
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-800/80">
            {enquiries.slice(0, 4).map((enq) => (
              <div key={enq.id} className="py-3 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">{enq.name}</p>
                  <p className="text-[11px] text-indigo-400 font-medium">{enq.interestedCourse}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{enq.message}</p>
                </div>
                <Badge
                  variant={
                    enq.status === 'NEW'
                      ? 'destructive'
                      : enq.status === 'CONVERTED'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {enq.status}
                </Badge>
              </div>
            ))}
            {enquiries.length === 0 && (
              <p className="py-4 text-xs text-slate-500 text-center">No new enquiries yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
