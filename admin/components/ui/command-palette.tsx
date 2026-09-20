'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  HelpCircle,
  Bell,
  Sparkles,
  ArrowRight,
  Layers,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SearchResultItem } from '@/app/api/admin/search/route';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: string;
  icon: React.ReactNode;
}

const STATIC_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'act-student',
    title: 'Enroll New Student',
    subtitle: 'Register candidate into active batch cohort',
    href: '/admin/students',
    category: 'Quick Actions',
    icon: <Users className="h-4 w-4 text-blue-600" />,
  },
  {
    id: 'act-batch',
    title: 'Create Academic Batch',
    subtitle: 'Setup timetable, room & capacity limit',
    href: '/admin/batches',
    category: 'Quick Actions',
    icon: <Layers className="h-4 w-4 text-amber-600" />,
  },
  {
    id: 'act-live',
    title: 'Schedule Live Classroom',
    subtitle: 'Initiate Jitsi live lecture stream',
    href: '/admin/live-classes',
    category: 'Quick Actions',
    icon: <Calendar className="h-4 w-4 text-emerald-600" />,
  },
  {
    id: 'act-exam',
    title: 'Create Full Mock Test (CBT)',
    subtitle: 'Configure timed simulation test series',
    href: '/admin/mock-exams',
    category: 'Quick Actions',
    icon: <HelpCircle className="h-4 w-4 text-purple-600" />,
  },
  {
    id: 'act-announcement',
    title: 'Broadcast Flash Announcement',
    subtitle: 'Publish emergency bulletin to campus & app',
    href: '/admin/announcements',
    category: 'Quick Actions',
    icon: <Bell className="h-4 w-4 text-rose-600" />,
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut listener for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open from parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live Debounced Backend Query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined Items
  const isSearching = query.trim().length >= 2;
  const displayItems = isSearching
    ? results
    : STATIC_QUICK_ACTIONS.map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        subtitle: a.subtitle,
        href: a.href,
      }));

  const handleSelect = (item: { href: string }) => {
    router.push(item.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, displayItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayItems.length) % Math.max(1, displayItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayItems[selectedIndex]) {
        handleSelect(displayItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-command overflow-hidden flex flex-col max-h-[80vh] duration-150 animate-in zoom-in-95"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-border bg-canvas-subtle/40">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, faculty, courses, batches, exams, live classes... (or type a command)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-4 text-xs sm:text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground bg-surface border border-border rounded shadow-subtle">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/40">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {isSearching ? `Matching Results (${results.length})` : 'High-Frequency Command Actions'}
          </div>

          <div className="space-y-0.5 pt-1">
            {displayItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs',
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-canvas-subtle text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0',
                        isSelected ? 'bg-white/20 text-white' : 'bg-canvas-muted text-muted-foreground'
                      )}
                    >
                      {item.category === 'Students' ? (
                        <Users className="h-3.5 w-3.5" />
                      ) : item.category === 'Faculty' ? (
                        <GraduationCap className="h-3.5 w-3.5" />
                      ) : item.category === 'Courses' ? (
                        <BookOpen className="h-3.5 w-3.5" />
                      ) : item.category === 'Batches' ? (
                        <Layers className="h-3.5 w-3.5" />
                      ) : item.category === 'Live Classes' ? (
                        <Calendar className="h-3.5 w-3.5" />
                      ) : item.category === 'Exams' ? (
                        <HelpCircle className="h-3.5 w-3.5" />
                      ) : item.category === 'Assignments' ? (
                        <FileText className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{item.title}</p>
                      <p
                        className={cn(
                          'text-[11px] truncate',
                          isSelected ? 'text-white/80' : 'text-muted-foreground'
                        )}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={cn(
                        'text-[10px] uppercase font-bold px-1.5 py-0.5 rounded',
                        isSelected ? 'bg-white/20 text-white' : 'bg-canvas-subtle text-muted-foreground border border-border'
                      )}
                    >
                      {item.category}
                    </span>
                    <ArrowRight className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-muted-foreground')} />
                  </div>
                </div>
              );
            })}

            {isSearching && results.length === 0 && !isLoading && (
              <div className="py-10 text-center space-y-2">
                <Search className="h-7 w-7 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold text-foreground">No matching institutional records found</p>
                <p className="text-[11px] text-muted-foreground">
                  Try searching by student roll number, candidate name, teacher name, or course code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-canvas-subtle/80 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono font-bold bg-surface border border-border px-1.5 py-0.5 rounded shadow-subtle">↑</kbd> <kbd className="font-mono font-bold bg-surface border border-border px-1.5 py-0.5 rounded shadow-subtle">↓</kbd> Navigate</span>
            <span><kbd className="font-mono font-bold bg-surface border border-border px-1.5 py-0.5 rounded shadow-subtle">↵</kbd> Select</span>
            <span><kbd className="font-mono font-bold bg-surface border border-border px-1.5 py-0.5 rounded shadow-subtle">ESC</kbd> Close</span>
          </div>
          <span className="font-medium hidden sm:inline">OCI Master Command Engine</span>
        </div>
      </div>
    </div>
  );
}
