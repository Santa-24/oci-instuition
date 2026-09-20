import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  statusPill?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  statusPill,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const effectiveBadge = statusPill || badge;
  const effectiveActions = actions || children;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {title}
          </h1>
          {effectiveBadge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {effectiveActions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {effectiveActions}
        </div>
      )}
    </div>
  );
}
