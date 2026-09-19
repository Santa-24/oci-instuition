'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Batch } from '@/lib/types/admin';
import { BookOpen, HelpCircle } from 'lucide-react';

interface BatchProgressChartProps {
  batches?: Batch[];
}

export function BatchProgressChart({ batches = [] }: BatchProgressChartProps) {
  const colors = [
    'bg-emerald-500',
    'bg-indigo-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-purple-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Curriculum & Capacity</CardTitle>
        <CardDescription>Live enrolled batches in Bhadrak campus</CardDescription>
      </CardHeader>
      <div className="space-y-4 pt-2">
        {batches.map((b, index) => {
          const color = colors[index % colors.length];
          const capacityPercent = b.capacity ? Math.min(100, Math.round((b.enrolledCount / b.capacity) * 100)) : 100;
          return (
            <div key={b.id || b.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200 truncate max-w-[200px]">{b.name}</span>
                <span className="text-white font-bold">{b.enrolledCount} / {b.capacity} Seats</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.max(10, capacityPercent)}%` }}
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{b.schedule || 'Scheduled'}</span>
                <span className="capitalize text-emerald-400 font-semibold">{b.status || 'Active'}</span>
              </div>
            </div>
          );
        })}

        {batches.length === 0 && (
          <div className="py-8 text-center space-y-2">
            <BookOpen className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No active batches found in Supabase.</p>
            <p className="text-[11px] text-slate-500">Create a batch under Education &gt; Batches.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface ExamParticipationChartProps {
  totalAttempts?: number;
  activeExamsCount?: number;
}

export function ExamParticipationChart({ totalAttempts = 0, activeExamsCount = 0 }: ExamParticipationChartProps) {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Mock Exam Attempts & Participation (2026)</CardTitle>
          <CardDescription>Monthly completed student tests across active batches</CardDescription>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          {totalAttempts > 0 ? `${totalAttempts} Total Attempts` : 'Live Supabase Assessment'}
        </span>
      </CardHeader>
      
      {totalAttempts > 0 ? (
        <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2">
          {months.map((month) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full bg-slate-800/80 rounded-t-lg relative overflow-hidden flex items-end h-32">
                <div
                  style={{ height: '20%' }}
                  className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg group-hover:from-indigo-600 group-hover:to-indigo-400 transition-all duration-500"
                />
              </div>
              <span className="text-xs font-semibold text-slate-400">{month}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <HelpCircle className="h-8 w-8 text-slate-600" />
          <p className="text-xs font-semibold text-slate-300">0 Mock Test Attempts Logged</p>
          <p className="text-[11px] text-slate-500 max-w-sm">
            {activeExamsCount > 0
              ? `${activeExamsCount} CBT exam(s) published in Supabase. Real student attempts will chart dynamically here once taken.`
              : 'No mock exams or attempts recorded yet. Published mock tests will evaluate here in real time.'}
          </p>
        </div>
      )}
    </Card>
  );
}
