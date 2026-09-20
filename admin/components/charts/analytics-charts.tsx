'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { Batch, MockExam } from '@/lib/types/admin';
import { BookOpen, HelpCircle, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BatchProgressChartProps {
  batches?: Batch[];
  onCreateBatch?: () => void;
}

export function BatchProgressChart({ batches = [], onCreateBatch }: BatchProgressChartProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Cohort Seat Capacity & Rosters</CardTitle>
          <CardDescription>Live enrolled aspirants vs classroom limits in Bhadrak campus</CardDescription>
        </div>
        <Link
          href="/admin/batches"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>All Batches</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <div className="flex-1 p-2 space-y-4">
        {batches.slice(0, 5).map((b, index) => {
          const capacity = b.capacity || 60;
          const enrolled = b.enrolledCount || 0;
          const percent = Math.min(100, Math.round((enrolled / capacity) * 100));

          return (
            <div key={b.id || index} className="p-3 rounded-xl border border-border bg-canvas-subtle/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground truncate max-w-[220px]">{b.name}</span>
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {enrolled} / {capacity} <span className="text-[10px] text-muted-foreground font-normal">Seats</span>
                </span>
              </div>

              {/* Precise Capacity Rail */}
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.max(4, percent)}%` }}
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    percent >= 90
                      ? 'bg-rose-500'
                      : percent >= 70
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  )}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate">{b.roomName || 'Campus Lecture Hall'} • {b.schedule || 'Scheduled'}</span>
                <span className="font-bold text-foreground">{percent}% Capacity</span>
              </div>
            </div>
          );
        })}

        {batches.length === 0 && (
          <EmptyState
            icon={<Layers className="h-5 w-5 text-muted-foreground" />}
            title="No Active Batches Configured"
            description="Create your first academic cohort with designated classroom and capacity limits."
            actionLabel="Create Cohort Batch"
            onAction={onCreateBatch || (() => { window.location.href = '/admin/batches'; })}
            compact
          />
        )}
      </div>
    </Card>
  );
}

interface ExamParticipationChartProps {
  exams?: MockExam[];
  totalAttempts?: number;
  onScheduleExam?: () => void;
}

export function ExamParticipationChart({
  exams = [],
  totalAttempts = 0,
  onScheduleExam,
}: ExamParticipationChartProps) {
  const publishedExams = exams.filter((e) => e.isPublished);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>CBT Examination Series & Participation</CardTitle>
          <CardDescription>Live computer-based simulation tests across academic streams</CardDescription>
        </div>
        <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-full bg-canvas-subtle border border-border">
          {totalAttempts > 0 ? `${totalAttempts} Verified Submissions` : 'Real-Time Database Sync'}
        </span>
      </CardHeader>

      <div className="flex-1 p-2">
        {publishedExams.length > 0 ? (
          <div className="space-y-3">
            {publishedExams.slice(0, 4).map((exam) => (
              <div
                key={exam.id}
                className="p-3 rounded-xl border border-border bg-canvas-subtle/50 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-bold text-foreground truncate">{exam.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {exam.courseName} • {exam.durationMinutes} mins • {exam.totalMarks} Marks
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-foreground tabular-nums">
                    {exam.attemptCount || 0} Attempts
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active Assessment
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
            title="No CBT Mock Tests Published"
            description="Author full mock examinations or practice drills with negative marking weights."
            actionLabel="Schedule CBT Exam"
            onAction={onScheduleExam || (() => { window.location.href = '/admin/mock-exams'; })}
            compact
          />
        )}
      </div>
    </Card>
  );
}
