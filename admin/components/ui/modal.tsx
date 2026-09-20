'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className={cn(
          'relative w-full rounded-2xl border border-border bg-surface p-6 shadow-command duration-150 animate-in zoom-in-95',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="space-y-0.5">
            {title && <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground leading-normal">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-canvas-subtle hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
