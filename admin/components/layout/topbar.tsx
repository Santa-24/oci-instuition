'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ExternalLink, LogOut, Radio } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function Topbar() {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search students, courses, receipts, batches..."
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Action Controls & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live System Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <Radio className="h-3.5 w-3.5" />
          <span>2 Classes Live</span>
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          href="/admin/notifications"
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </Link>

        {/* Live Website Preview Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('/', '_blank')}
          leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
        >
          View Live Site
        </Button>

        <div className="h-6 w-px bg-slate-800" />

        {/* Log Out */}
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
