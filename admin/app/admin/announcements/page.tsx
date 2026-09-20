'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, RefreshCw, Trash2, Megaphone, Search, AlertCircle } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  is_urgent: boolean;
  created_at: string;
}

export default function AnnouncementsAdminPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Admissions');
  const [formIsUrgent, setFormIsUrgent] = useState(false);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setNotices(json.announcements || []);
      }
    } catch (e: any) {
      console.error('Failed to load notices:', e);
      setFeedback({ type: 'error', message: 'Failed to load announcements from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      setFeedback({ type: 'error', message: 'Notice title is required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim() || formTitle.trim(),
          category: formCategory,
          isUrgent: formIsUrgent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish notice');

      await fetchNotices();
      setFormTitle('');
      setFormContent('');
      setFormIsUrgent(false);
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Announcement published successfully!' });
    } catch (err: any) {
      console.error('Failed to publish notice:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to publish notice' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete notice "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');
      setNotices((prev) => prev.filter((n) => n.id !== id));
      setFeedback({ type: 'success', message: 'Notice deleted from database.' });
    } catch (err: any) {
      console.error('Failed to delete notice:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete notice' });
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [notices, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notice Board & Announcements"
        description="Publish campus circulars, exam schedules, and urgent alerts across student mobile apps and web portal."
        statusPill={<StatusBadge status="live" label="CAMPUS BROADCAST" size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchNotices}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Sync DB
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Post New Notice
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices by headline or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Categories ({notices.length})</option>
            <option value="Admissions">Admissions</option>
            <option value="Exams">Exams</option>
            <option value="Holidays">Holidays</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {filteredNotices.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Notice Title &amp; Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotices.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="max-w-md">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Megaphone className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    {n.content && n.content !== n.title && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {n.content}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {n.category || 'General'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {n.is_urgent ? (
                      <StatusBadge status="urgent" label="URGENT FLASH" size="sm" />
                    ) : (
                      <StatusBadge status="draft" label="NORMAL" size="sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(n.id, n.title)}
                      className="text-slate-400 hover:text-rose-600 h-7 w-7 p-0 inline-flex items-center justify-center"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={Megaphone}
            title={searchQuery || categoryFilter !== 'ALL' ? 'No Matching Announcements' : 'No Notices Published Yet'}
            description={
              searchQuery || categoryFilter !== 'ALL'
                ? 'Try adjusting your search criteria or category filter.'
                : 'Broadcast official campus notices, exam schedules, and holiday announcements to all enrolled students.'
            }
            actionLabel={searchQuery || categoryFilter !== 'ALL' ? 'Clear Filters' : 'Post New Notice'}
            onAction={
              searchQuery || categoryFilter !== 'ALL'
                ? () => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                  }
                : () => setIsModalOpen(true)
            }
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading announcements from live database...</span>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast New Campus Notice">
        <div className="space-y-4">
          <Input
            label="Notice Headline"
            placeholder="e.g. OSSC CGL Prelims Special Marathon Session on Sunday"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notice Content / Details
            </label>
            <textarea
              rows={3}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Detailed announcement details, classroom numbers, timing instructions..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="Admissions">Admissions &amp; New Batches</option>
                <option value="Exams">Mock Test &amp; Exam Schedule</option>
                <option value="Holidays">Campus Holiday Notice</option>
                <option value="General">General Circular</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={formIsUrgent ? 'urgent' : 'normal'}
                onChange={(e) => setFormIsUrgent(e.target.value === 'urgent')}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="normal">Normal Announcement</option>
                <option value="urgent">Urgent / Flash Alert</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Notice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
