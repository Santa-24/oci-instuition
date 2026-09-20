import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: IconProp,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  // Render icon whether it is a Component or a ReactNode
  let renderedIcon: React.ReactNode = null;
  if (IconProp) {
    if (typeof IconProp === 'function' || (typeof IconProp === 'object' && 'render' in IconProp)) {
      const Component = IconProp as React.ComponentType<{ className?: string }>;
      renderedIcon = <Component className="h-5 w-5" />;
    } else {
      renderedIcon = IconProp as React.ReactNode;
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-canvas-subtle/50',
        compact ? 'py-6 px-4 space-y-2' : 'py-12 px-6 space-y-3.5',
        className
      )}
    >
      {renderedIcon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-subtle">
          {renderedIcon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2 mt-2">
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="primary"
              onClick={onAction}
              leftIcon={actionIcon}
              className="text-xs"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSecondaryAction}
              className="text-xs"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
