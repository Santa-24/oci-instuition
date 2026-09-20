import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  glow?: boolean;
}

export function Card({
  className,
  elevated = false,
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface text-foreground shadow-card transition-all',
        elevated && 'shadow-elevated border-slate-300/80 dark:border-slate-700',
        glow && 'ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.08)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1 pb-4 border-b border-border/80 mb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-sm sm:text-base font-bold leading-tight tracking-tight text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-muted-foreground leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}
