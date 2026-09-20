import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-foreground block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-muted-foreground pointer-events-none">{leftIcon}</div>}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-subtle',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-muted-foreground">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
