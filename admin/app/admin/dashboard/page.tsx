'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Bell,
  ArrowRight,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BatchProgressChart, ExamParticipationChart } from '@/components/charts/analytics-charts';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam, EnquiryLead, Batch, LiveClass } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';

export default function AdminDashboardPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricData, batchList, classList] = await Promise.all([
        AcademicService.getDashboardMetrics(),
        AcademicService.getBatches(),
        AcademicService.getLiveClasses(),
      ]);

      if (metricData.success && metricData.stats) {
        setStudentCount(metricData.stats.studentsCount || 0);
        setBatchCount(metricData.stats.batchesCount || 0);
        setCourseCount(metricData.stats.coursesCount || 0);
        setTeacherCount(metricData.stats.teachersCount || 0);
        setEnquiryCount(metricData.stats.enquiriesCount || 0);
        setEnquiries(metricData.recentEnquiries || []);
        setExams(metricData.exams || []);
      }
      setBatches(batchList || []);
      setLiveClasses(classList || []);
    } catch (err) {
      console.warn('[Command Center Load Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute real actionable attention items
  const newLeads = enquiries.filter((e) => (e.status || '').toUpperCase() === 'NEW');
  const draftExams = exams.filter((e) => !e.isPublished);
  const liveNowClasses = liveClasses.filter((c) => (c.status || '').toLowerCase() === 'live');
  const totalAttempts = exams.reduce((acc, e) => acc + (e.attemptCount || 0), 0);

  const attentionItems = [
    ...newLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: 'LEAD',
      title: `New Admission Inquiry: ${lead.name}`,
      subtitle: `${lead.interestedCourse || 'General Course'} • Submitted via ${lead.source || 'Website'}`,
      href: '/admin/enquiries',
      actionText: 'Triage Lead',
      severity: 'high' as const,
    })),
    ...draftExams.map((exam) => ({
      id: `exam-${exam.id}`,
      type: 'EXAM',
      title: `Draft CBT Exam: ${exam.title}`,
      subtitle: `${exam.courseName || 'General Track'} • Awaiting publication`,
      href: '/admin/mock-exams',
      actionText: 'Publish Test',
      severity: 'medium' as const,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Top Operations Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Institutional Command Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              Live Operational Awareness
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Odisha Competitive Institute • Centralized management of cohorts, admissions, classroom schedules, and CBT testing.
          </p>
        </div>

        {/* Global Action Rail */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Sync State
          </Button>
          <Link href="/admin/students">
            <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />} className="text-xs">
              Enroll Student
            </Button>
          </Link>
          <Link href="/admin/live-classes">
            <Button
              size="sm"
              variant={liveNowClasses.length > 0 ? 'destructive' : 'secondary'}
              leftIcon={<Radio className={`h-3.5 w-3.5 ${liveNowClasses.length > 0 ? 'animate-pulse' : ''}`} />}
              className="text-xs"
            >
              {liveNowClasses.length > 0 ? `Monitor ${liveNowClasses.length} Live` : 'Class Timetable'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Operational Health Strips (100% Real Database Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Active Students"
          value={studentCount}
          subtext="Verified institute registrations"
          icon={<Users className="h-4 w-4" />}
          iconBgColor="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          href="/admin/students"
        />
        <StatsCard
          title="Active Cohorts"
          value={batchCount}
          subtext="Scheduled Bhadrak batches"
          icon={<Layers className="h-4 w-4" />}
          iconBgColor="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          href="/admin/batches"
        />
        <StatsCard
          title="Academic Programs"
          value={courseCount}
          subtext="SSC, State Govt, Rail, Banking"
          icon={<BookOpen className="h-4 w-4" />}
          iconBgColor="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          href="/admin/courses"
        />
        <StatsCard
          title="Faculty Mentors"
          value={teacherCount}
          subtext="Subject matter specialists"
          icon={<GraduationCap className="h-4 w-4" />}
          iconBgColor="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
          href="/admin/teachers"
        />
        <StatsCard
          title="Pending Inquiries"
          value={newLeads.length}
          subtext={`${enquiryCount} total leads registered`}
          trend={newLeads.length > 0 ? { value: `${newLeads.length} Unhandled`, isPositive: false } : { value: 'All Clear', neutral: true }}
          icon={<Phone className="h-4 w-4" />}
          iconBgColor="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          href="/admin/enquiries"
        />
      </div>

      {/* Row 2: Priority Action System ("Needs Attention") */}
      <Card className="p-5 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  attentionItems.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  attentionItems.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Needs Attention</h3>
            {attentionItems.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {attentionItems.length} Pending
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
            Operational queue filtered by urgency
          </span>
        </div>

        <div className="pt-3">
          {attentionItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attentionItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-canvas-subtle/40 flex items-center justify-between gap-3 hover:bg-canvas-subtle transition-colors"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-surface border border-border text-foreground">
                        {item.type}
                      </span>
                      <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>

                  <Link href={item.href}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3 w-3" />} className="text-xs shrink-0">
                      {item.actionText}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex items-center justify-center gap-2.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All institutional operations are completely up to date. No pending triage items.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Row 3: Operational Visualizations (Zero Fake Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BatchProgressChart batches={batches} />
        <ExamParticipationChart exams={exams} totalAttempts={totalAttempts} />
      </div>

      {/* Row 4: Classroom Timetable & Direct Admissions CRM Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classroom Schedule */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Classroom Schedule & Live Feeds</CardTitle>
              <CardDescription>Scheduled lectures and Jitsi rooms for active batches</CardDescription>
            </div>
            <Link href="/admin/live-classes">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />} className="text-xs">
                Classroom Manager
              </Button>
            </Link>
          </CardHeader>

          <div className="flex-1 p-2 divide-y divide-border/60">
            {liveClasses.slice(0, 4).map((cls) => (
              <div key={cls.id} className="py-3 px-2 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground truncate">{cls.title}</p>
                    <StatusBadge status={cls.status || 'scheduled'} />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {cls.subject} • {cls.scheduledStart ? formatDateTime(cls.scheduledStart) : 'Scheduled'}
                  </p>
                </div>

                <Link href="/admin/live-classes">
                  <Button size="sm" variant="outline" className="text-xs shrink-0">
                    Enter Jitsi
                  </Button>
                </Link>
              </div>
            ))}

            {liveClasses.length === 0 && (
              <EmptyState
                icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
                title="No Live Classes Scheduled Today"
                description="Coordinate upcoming faculty sessions and provide student stream links."
                actionLabel="Schedule Live Class"
                onAction={() => { window.location.href = '/admin/live-classes'; }}
                compact
              />
            )}
          </div>
        </Card>

        {/* Admissions Ingestion Queue */}
        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Admissions Lead Intake</CardTitle>
              <CardDescription>Website submissions and student inquiries</CardDescription>
            </div>
            <Link href="/admin/enquiries">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />} className="text-xs">
                CRM Pipeline
              </Button>
            </Link>
          </CardHeader>

          <div className="flex-1 p-2 divide-y divide-border/60">
            {enquiries.slice(0, 4).map((enq) => (
              <div key={enq.id} className="py-3 px-2 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground truncate">{enq.name}</p>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="text-[11px] text-primary font-semibold">{enq.interestedCourse}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{enq.message}</p>
                </div>

                <Link href="/admin/enquiries">
                  <Button size="sm" variant="outline" className="text-xs shrink-0">
                    Counsel
                  </Button>
                </Link>
              </div>
            ))}

            {enquiries.length === 0 && (
              <EmptyState
                icon={<Phone className="h-5 w-5 text-muted-foreground" />}
                title="No New Admission Enquiries"
                description="Incoming inquiries from the public website and app forms will ingest here in real time."
                compact
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
