'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  Bell,
  Smartphone,
  BarChart3,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Clock,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavSubItem {
  title: string;
  href: string;
}

interface NavGroup {
  groupTitle: string;
  items: {
    title: string;
    icon: React.ReactNode;
    href?: string;
    subItems?: NavSubItem[];
    badge?: string;
    isCms?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: 'COMMAND',
    items: [
      {
        title: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: '/admin/dashboard',
      },
    ],
  },
  {
    groupTitle: 'PEOPLE',
    items: [
      {
        title: 'Students Directory',
        icon: <Users className="h-4 w-4" />,
        href: '/admin/students',
      },
      {
        title: 'Faculty Mentors',
        icon: <GraduationCap className="h-4 w-4" />,
        href: '/admin/teachers',
      },
    ],
  },
  {
    groupTitle: 'ACADEMICS',
    items: [
      {
        title: 'Courses & Streams',
        icon: <BookOpen className="h-4 w-4" />,
        href: '/admin/courses',
      },
      {
        title: 'Subjects & Modules',
        icon: <Layers className="h-4 w-4" />,
        href: '/admin/subjects',
      },
      {
        title: 'Cohorts & Batches',
        icon: <Clock className="h-4 w-4" />,
        href: '/admin/batches',
      },
    ],
  },
  {
    groupTitle: 'CLASSROOM',
    items: [
      {
        title: 'Live Classes (Jitsi)',
        icon: <Radio className="h-4 w-4" />,
        href: '/admin/live-classes',
      },
      {
        title: 'Recorded Archives',
        icon: <Calendar className="h-4 w-4" />,
        href: '/admin/recorded-classes',
      },
      {
        title: 'Attendance Register',
        icon: <ShieldCheck className="h-4 w-4" />,
        href: '/admin/attendance',
      },
    ],
  },
  {
    groupTitle: 'LEARNING',
    items: [
      {
        title: 'Study Materials',
        icon: <FileText className="h-4 w-4" />,
        href: '/admin/materials',
      },
      {
        title: 'Assignments',
        icon: <FileText className="h-4 w-4" />,
        href: '/admin/assignments',
      },
    ],
  },
  {
    groupTitle: 'EXAMINATION',
    items: [
      {
        title: 'Question Bank',
        icon: <HelpCircle className="h-4 w-4" />,
        href: '/admin/question-bank',
      },
      {
        title: 'Practice Tests',
        icon: <HelpCircle className="h-4 w-4" />,
        href: '/admin/practice-tests',
      },
      {
        title: 'Mock Exams (CBT)',
        icon: <HelpCircle className="h-4 w-4" />,
        href: '/admin/mock-exams',
      },
      {
        title: 'Results & Rankings',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/admin/results',
      },
    ],
  },
  {
    groupTitle: 'COMMUNICATION',
    items: [
      {
        title: 'Campus Bulletins',
        icon: <Bell className="h-4 w-4" />,
        href: '/admin/announcements',
      },
      {
        title: 'Push Notifications',
        icon: <Bell className="h-4 w-4" />,
        href: '/admin/notifications',
      },
      {
        title: 'Admissions CRM Leads',
        icon: <Users className="h-4 w-4" />,
        href: '/admin/enquiries',
      },
    ],
  },
  {
    groupTitle: 'RELEASES & ASSETS',
    items: [
      {
        title: 'Android APK Releases',
        icon: <Smartphone className="h-4 w-4" />,
        href: '/admin/app-releases',
      },
      {
        title: 'Media Library',
        icon: <ImageIcon className="h-4 w-4" />,
        href: '/admin/media',
      },
    ],
  },
  {
    groupTitle: 'INSIGHTS',
    items: [
      {
        title: 'Institutional Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/admin/analytics',
      },
    ],
  },
  {
    groupTitle: 'WEBSITE CMS',
    items: [
      {
        title: 'Public Portal Sandbox',
        icon: <Globe className="h-4 w-4 text-amber-400" />,
        isCms: true,
        subItems: [
          { title: 'Homepage Hero & Trust', href: '/admin/website/homepage' },
          { title: 'About Institutional Story', href: '/admin/website/about' },
          { title: 'Vision & Mission Tenets', href: '/admin/website/vision' },
          { title: 'Director Message', href: '/admin/website/director' },
          { title: 'Why OCI Pedagogical Rail', href: '/admin/website/why-oci' },
          { title: 'Examinations Catalog', href: '/admin/website/examinations' },
          { title: 'App Showcase Features', href: '/admin/website/app-showcase' },
          { title: 'Selection Success Stories', href: '/admin/website/success-stories' },
          { title: 'Public Faculty Profiles', href: '/admin/website/faculty' },
          { title: 'Verified Testimonials', href: '/admin/website/testimonials' },
          { title: 'Campus Gallery', href: '/admin/website/gallery' },
          { title: 'Admissions FAQs', href: '/admin/website/faqs' },
          { title: 'SEO & Social Graph', href: '/admin/website/seo' },
        ],
      },
    ],
  },
  {
    groupTitle: 'SYSTEM',
    items: [
      {
        title: 'System Settings',
        icon: <Settings className="h-4 w-4" />,
        subItems: [
          { title: 'General Institution', href: '/admin/settings/general' },
          { title: 'Campus Contact Info', href: '/admin/settings/contact' },
          { title: 'Official Social Media', href: '/admin/settings/social' },
          { title: 'Staff Accounts', href: '/admin/settings/administrators' },
          { title: 'Roles & RBAC Matrix', href: '/admin/settings/roles' },
          { title: 'Immutable Audit Logs', href: '/admin/settings/audit-logs' },
        ],
      },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'Public Portal Sandbox': pathname.startsWith('/admin/website'),
    'System Settings': pathname.startsWith('/admin/settings'),
  });

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-screen sticky top-0 select-none z-30 shrink-0 shadow-subtle',
        className
      )}
    >
      {/* Institutional Crest Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3 bg-slate-950/40">
        <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm tracking-wider">
          OCI
        </div>
        <div className="min-w-0">
          <h1 className="text-xs font-black text-white tracking-wider truncate flex items-center gap-1.5">
            MASTER ADMIN
            <ShieldCheck className="h-3 w-3 text-blue-400 shrink-0" />
          </h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
            Nayabazar, Bhadrak
          </p>
        </div>
      </div>

      {/* Domain Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <h4 className="px-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {group.groupTitle}
            </h4>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                if (item.href) {
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            'shrink-0',
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                const isOpen = openSubMenus[item.title] ?? false;
                const isGroupActive = item.subItems?.some((sub) => pathname === sub.href);

                return (
                  <div key={item.title} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleSubMenu(item.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors group',
                        isGroupActive
                          ? 'text-white bg-slate-800/80'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('shrink-0', item.isCms ? 'text-amber-400' : 'text-slate-400')}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.isCms && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            CMS
                          </span>
                        )}
                        {isOpen ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && item.subItems && (
                      <div className="ml-5 pl-2.5 border-l border-slate-800 space-y-0.5 my-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                'block px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors truncate',
                                isSubActive
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                              )}
                            >
                              {sub.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Operator Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-[11px] text-blue-400">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Master Administrator</p>
            <p className="text-[10px] text-emerald-400 font-semibold truncate">Active Supabase Session</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
