import React from 'react';
import { cn } from '@/lib/utils/cn';

export type OperationalStatus =
  | 'active'
  | 'live'
  | 'scheduled'
  | 'completed'
  | 'draft'
  | 'published'
  | 'new'
  | 'contacted'
  | 'converted'
  | 'closed'
  | 'urgent'
  | 'warning'
  | 'pending'
  | 'present'
  | 'absent'
  | 'late'
  | 'inactive'
  | 'neutral'
  | 'archived';

export interface StatusBadgeProps {
  status: OperationalStatus | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, label, size = 'md', className, pulse }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status;

  switch (norm) {
    case 'live':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      dotColor = 'bg-emerald-500';
      if (!label) displayLabel = 'LIVE NOW';
      break;
    case 'active':
    case 'published':
    case 'present':
    case 'converted':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      dotColor = 'bg-emerald-500';
      break;
    case 'new':
    case 'urgent':
    case 'absent':
      styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      dotColor = 'bg-rose-500';
      break;
    case 'warning':
    case 'contacted':
    case 'pending':
    case 'scheduled':
    case 'late':
      styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      dotColor = 'bg-amber-500';
      break;
    case 'neutral':
      styles = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
      dotColor = 'bg-primary-500';
      break;
    case 'draft':
    case 'inactive':
    case 'closed':
    case 'archived':
    case 'completed':
      styles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
      dotColor = 'bg-slate-400';
      break;
  }

  const shouldPulse = pulse ?? (norm === 'live' || norm === 'urgent');

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase border',
        sizeStyles,
        styles,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {shouldPulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColor
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColor)} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}
