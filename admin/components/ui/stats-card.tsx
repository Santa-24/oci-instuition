import React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils/cn';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  glow?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBgColor = 'bg-indigo-500/15 text-indigo-400',
  glow = false,
  className,
}: StatsCardProps) {
  return (
    <Card glow={glow} className={cn('p-5 hover:border-slate-700 transition-all', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h4 className="text-2xl font-black text-white tracking-tight">{value}</h4>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={cn(
                'text-xs font-bold',
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
        </div>
      </div>
    </Card>
  );
}
