'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/ui/stats-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ExamParticipationChart, BatchProgressChart } from '@/components/charts/analytics-charts';
import { AcademicService } from '@/lib/services/academic-service';
import { Users, BookOpen, Award, Video, RefreshCw, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export default function AnalyticsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeBatches: 0,
    totalExams: 0,
    liveSessions: 0,
    totalCourses: 0,
    resultsRecorded: 0,
    averageAccuracy: '0%',
  });

  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      const [students, batches, exams, liveClasses, courses, results] = await Promise.all([
        AcademicService.getStudents().catch(() => []),
        AcademicService.getBatches().catch(() => []),
        AcademicService.getExams().catch(() => []),
        AcademicService.getLiveClasses().catch(() => []),
        AcademicService.getCourses().catch(() => []),
        AcademicService.getResults().catch(() => []),
      ]);

      let avgAcc = '0%';
      if (results.length > 0) {
        const sumAcc = results.reduce((acc: number, r: any) => acc + (parseFloat(r.accuracy) || 0), 0);
        avgAcc = `${(sumAcc / results.length).toFixed(1)}%`;
      }

      setMetrics({
        totalStudents: students.length,
        activeBatches: batches.filter((b: any) => b.status === 'ACTIVE' || !b.status).length,
        totalExams: exams.length,
        liveSessions: liveClasses.length,
        totalCourses: courses.length,
        resultsRecorded: results.length,
        averageAccuracy: avgAcc,
      });
    } catch (err) {
      console.error('Failed to load analytics KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Analytics & KPIs"
        description="Live operational telemetry, cohort size, syllabus progression, and examination metrics from Supabase."
        statusPill={<StatusBadge status="live" label="LIVE TELEMETRY" size="sm" />}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLiveMetrics}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh Metrics
          </Button>
        }
      />

      {/* Primary KPI Grid - Strictly Live Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Enrolled Students"
          value={loading ? '...' : String(metrics.totalStudents)}
          subtext={metrics.totalStudents === 0 ? 'No active enrollments yet' : 'Verified Supabase Student Records'}
          icon={<Users className="h-4 w-4" />}
          iconBgColor="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
        />
        <StatsCard
          title="Active Batches"
          value={loading ? '...' : String(metrics.activeBatches)}
          subtext="Central & State Exam Cohorts"
          icon={<Layers className="h-4 w-4" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="CBT Mock Exams"
          value={loading ? '...' : String(metrics.totalExams)}
          subtext={metrics.resultsRecorded > 0 ? `${metrics.resultsRecorded} Scorecards Recorded` : 'Question Bank Assessments'}
          icon={<Award className="h-4 w-4" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
        />
        <StatsCard
          title="Classroom Sessions"
          value={loading ? '...' : String(metrics.liveSessions)}
          subtext="Live Jitsi & Recorded Lectures"
          icon={<Video className="h-4 w-4" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExamParticipationChart />
        <BatchProgressChart />
      </div>

      {/* Operational Highlights Card */}
      <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              OCI Academic Operations Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target examination streams supported at Odisha Competitive Institute Nayabazar campus.
            </p>
          </div>
          <Link href="/admin/courses">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Explore All Programs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { stream: 'SSC (CGL/CHSL)', status: 'Active Curriculum' },
            { stream: 'Odisha OSSC / OSSSC', status: 'State Govt Priority' },
            { stream: 'Railways RRB', status: 'NTPC / Group D' },
            { stream: 'Banking (IBPS/SBI)', status: 'PO & Clerical' },
            { stream: 'Teaching Exams', status: 'OTET / OSSTET' },
            { stream: 'Defence & Police', status: 'Odisha Police SI' },
          ].map((item) => (
            <div
              key={item.stream}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1"
            >
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.stream}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
