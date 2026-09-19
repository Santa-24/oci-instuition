'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Award,
  CalendarCheck,
  ClipboardList,
  Bell,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Live Classes', href: '/student/classes', icon: Video },
    { label: 'Study Materials', href: '/student/materials', icon: FileText },
    { label: 'CBT Mock Tests', href: '/student/exams', icon: HelpCircle },
    { label: 'Exam Results & AIR', href: '/student/results', icon: Award },
    { label: 'Assignments', href: '/student/assignments', icon: ClipboardList },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20">
              OCI
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">Student Portal</h2>
              <p className="text-[10px] text-indigo-400 font-semibold">Odisha Competitive Inst.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Student Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">Aarav Pattnaik</p>
              <p className="text-[10px] text-slate-400 truncate">Roll: OCI-2026-0042</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-[#0B1120]/80 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Enrolled Batch:</span>
            <span className="text-xs font-extrabold text-white bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              SSC Pinnacle Morning Super 40
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Aspirant
            </div>
          </div>
        </header>

        {/* Page Children */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
