import React from 'react';
import Link from 'next/link';
import { Card } from './card';
import { cn } from '@/lib/utils/cn';
import { ArrowUpRight } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  glow?: boolean;
  href?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  glow,
  href,
  className,
}: StatsCardProps) {
  const content = (
    <Card
      className={cn(
        'p-5 hover:border-slate-400/60 dark:hover:border-slate-700 transition-all group relative overflow-hidden',
        glow && 'ring-1 ring-primary-500/20 shadow-elevated',
        href && 'cursor-pointer hover:shadow-elevated',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-border shadow-subtle',
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {value}
          </div>
          {subtext && (
            <p className="text-[11px] font-medium text-muted-foreground mt-1">
              {subtext}
            </p>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
              trend.neutral
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
            )}
          >
            <span>{trend.isPositive ? '↑' : trend.neutral ? '—' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
