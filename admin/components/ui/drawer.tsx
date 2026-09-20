'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'md',
}: DrawerProps) {
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

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'w-screen bg-surface border-l border-border shadow-2xl flex flex-col',
            widthClasses
          )}
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-canvas-subtle/50">
            <div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
