'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ExternalLink,
  LogOut,
  Radio,
  Plus,
  ChevronDown,
  Menu,
  Sparkles,
  Users,
  Layers,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { CommandPalette } from '../ui/command-palette';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-subtle select-none">
        {/* Left: Mobile Menu Toggle & Global Search Bar Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-canvas-subtle"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Interactive Global Search Trigger */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 w-56 sm:w-80 h-9 px-3 rounded-xl border border-border bg-canvas-subtle/80 hover:bg-canvas-subtle hover:border-slate-400/60 dark:hover:border-slate-700 text-xs text-muted-foreground transition-all shadow-subtle group"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
            <span className="truncate text-left flex-1 font-medium">Quick search or command...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground bg-surface border border-border rounded shadow-subtle shrink-0">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick-Create Action Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQuickCreateOpen((prev) => !prev)}
              leftIcon={<Plus className="h-3.5 w-3.5 text-primary" />}
              rightIcon={<ChevronDown className="h-3 w-3 text-muted-foreground" />}
              className="text-xs font-bold"
            >
              <span className="hidden sm:inline">Quick Action</span>
            </Button>

            {isQuickCreateOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-surface rounded-xl border border-border shadow-elevated py-1 z-30 animate-in fade-in zoom-in-95"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border">
                  Institute Actions
                </div>
                <Link
                  href="/admin/students"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-canvas-subtle transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span>Enroll Student</span>
                </Link>
                <Link
                  href="/admin/batches"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-canvas-subtle transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-amber-600" />
                  <span>Create Batch</span>
                </Link>
                <Link
                  href="/admin/live-classes"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-canvas-subtle transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Schedule Class</span>
                </Link>
                <Link
                  href="/admin/mock-exams"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-canvas-subtle transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
                  <span>Create CBT Exam</span>
                </Link>
                <Link
                  href="/admin/announcements"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-canvas-subtle transition-colors"
                >
                  <Bell className="h-3.5 w-3.5 text-rose-600" />
                  <span>Publish Notice</span>
                </Link>
              </div>
            )}
          </div>

          {/* Live Supabase Connection Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live DB</span>
          </div>

          {/* Notifications Trigger */}
          <Link
            href="/admin/notifications"
            className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-canvas-subtle transition-colors"
            title="Push Notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>

          {/* Public Portal Shortcut */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://oci-instuition.vercel.app';
              window.open(url, '_blank');
            }}
            leftIcon={<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
            className="hidden sm:inline-flex text-xs"
          >
            Live Portal
          </Button>

          <div className="h-5 w-px bg-border mx-1" />

          {/* Logout Trigger */}
          <button
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase/client');
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign out of command session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
