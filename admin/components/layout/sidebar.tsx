'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  GraduationCap,
  Video,
  FileText,
  HelpCircle,
  Bell,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavSubItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  href?: string;
  items?: NavSubItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: '/admin/dashboard',
  },
  {
    title: 'WEBSITE CMS',
    icon: <Globe className="h-4 w-4" />,
    items: [
      { title: 'Homepage', href: '/admin/website/homepage' },
      { title: 'About OCI', href: '/admin/website/about' },
      { title: 'Vision & Mission', href: '/admin/website/vision' },
      { title: 'Director Message', href: '/admin/website/director' },
      { title: 'Why OCI', href: '/admin/website/why-oci' },
      { title: 'Examinations', href: '/admin/website/examinations' },
      { title: 'App Showcase', href: '/admin/website/app-showcase' },
      { title: 'Success Stories', href: '/admin/website/success-stories' },
      { title: 'Faculty Profiles', href: '/admin/website/faculty' },
      { title: 'Testimonials', href: '/admin/website/testimonials' },
      { title: 'Gallery', href: '/admin/website/gallery' },
      { title: 'FAQs', href: '/admin/website/faqs' },
      { title: 'SEO Settings', href: '/admin/website/seo' },
    ],
  },
  {
    title: 'EDUCATION',
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { title: 'Students', href: '/admin/students' },
      { title: 'Teachers', href: '/admin/teachers' },
      { title: 'Courses', href: '/admin/courses' },
      { title: 'Subjects', href: '/admin/subjects' },
      { title: 'Batches', href: '/admin/batches' },
    ],
  },
  {
    title: 'LIVE LEARNING',
    icon: <Video className="h-4 w-4" />,
    items: [
      { title: 'Live Classes', href: '/admin/live-classes' },
      { title: 'Recorded Classes', href: '/admin/recorded-classes' },
      { title: 'Study Materials', href: '/admin/materials' },
    ],
  },
  {
    title: 'ASSIGNMENTS',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { title: 'Assignments', href: '/admin/assignments' },
    ],
  },
  {
    title: 'EXAMINATION',
    icon: <HelpCircle className="h-4 w-4" />,
    items: [
      { title: 'Question Bank', href: '/admin/question-bank' },
      { title: 'Practice Tests', href: '/admin/practice-tests' },
      { title: 'Mock Exams', href: '/admin/mock-exams' },
      { title: 'Results & AIR', href: '/admin/results' },
    ],
  },
  {
    title: 'COMMUNICATION',
    icon: <Bell className="h-4 w-4" />,
    items: [
      { title: 'Push Notifications', href: '/admin/notifications' },
      { title: 'Announcements', href: '/admin/announcements' },
      { title: 'Enquiries / Leads', href: '/admin/enquiries' },
    ],
  },
  {
    title: 'APP RELEASES',
    icon: <Smartphone className="h-4 w-4" />,
    href: '/admin/app-releases',
  },
  {
    title: 'MEDIA',
    icon: <ImageIcon className="h-4 w-4" />,
    href: '/admin/media',
  },
  {
    title: 'ANALYTICS',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/admin/analytics',
  },
  {
    title: 'SETTINGS',
    icon: <Settings className="h-4 w-4" />,
    items: [
      { title: 'General Info', href: '/admin/settings/general' },
      { title: 'Contact Settings', href: '/admin/settings/contact' },
      { title: 'Social Links', href: '/admin/settings/social' },
      { title: 'Administrators', href: '/admin/settings/administrators' },
      { title: 'Roles & Permissions', href: '/admin/settings/roles' },
      { title: 'Audit Logs', href: '/admin/settings/audit-logs' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'WEBSITE CMS': true,
    EDUCATION: true,
    'FEES & PAYMENTS': true,
    'LIVE LEARNING': true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 gap-3">
        <img
          src="/oci-logo.svg"
          alt="OCI Logo"
          className="h-10 w-10 shrink-0 drop-shadow-md rounded-full bg-white/10 p-0.5"
        />
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1.5">
            OCI ADMIN
            <Shield className="h-3 w-3 text-indigo-400" />
          </h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Command Center
          </p>
        </div>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navSections.map((section) => {
          if (section.href) {
            const isActive = pathname === section.href;
            return (
              <Link
                key={section.title}
                href={section.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                )}
              >
                {section.icon}
                <span>{section.title}</span>
              </Link>
            );
          }

          const isOpen = openSections[section.title] ?? false;
          const isSectionActive = section.items?.some((item) => pathname === item.href);

          return (
            <div key={section.title} className="pt-1">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors',
                  isSectionActive
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )}
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="tracking-wide text-[11px] uppercase">{section.title}</span>
                </div>
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>

              {isOpen && section.items && (
                <div className="ml-7 pl-2 border-l border-slate-800 my-1 space-y-0.5">
                  {section.items.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          'block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                          isSubActive
                            ? 'text-white bg-indigo-600 font-semibold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
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
      </nav>

      {/* Footer Identity */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-400">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">OCI Administrator</p>
            <p className="text-[10px] text-emerald-400 font-semibold truncate">SUPER_ADMIN</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
