'use client';

import React from 'react';
import { StatsCard } from '@/components/ui/stats-card';
import { ExamParticipationChart, BatchProgressChart } from '@/components/charts/analytics-charts';
import { Users, BookOpen, Award, Calendar } from 'lucide-react';

export default function AnalyticsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Institutional Analytics & KPIs</h1>
        <p className="text-xs text-slate-400 mt-1">Growth trends, batch syllabus performance, and exam selection ratios.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Enrollment"
          value="420"
          trend={{ value: '18% YoY', isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Lecture Completion"
          value="94.2%"
          trend={{ value: '1.8%', isPositive: true }}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="Top 500 AIR Selections"
          value="48"
          subtext="JEE & NEET 2025"
          icon={<Award className="h-4 w-4" />}
          iconBgColor="bg-amber-500/15 text-amber-400"
        />
        <StatsCard
          title="Active Mock Tests"
          value="1,240"
          trend={{ value: '24.8%', isPositive: true }}
          icon={<BookOpen className="h-4 w-4" />}
          iconBgColor="bg-emerald-500/15 text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExamParticipationChart />
        <BatchProgressChart />
      </div>
    </div>
  );
}
