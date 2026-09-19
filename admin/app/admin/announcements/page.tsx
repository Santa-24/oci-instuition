'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, RefreshCw, Trash2, Megaphone } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Announcements & Notice Board</h1>
          <p className="text-xs text-slate-400 mt-1">Publish campus circulars, exam schedules, and alerts to student apps and website.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchNotices} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Post New Notice
          </Button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 font-bold ml-2">×</button>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notice Title & Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading announcements from database...
                </TableCell>
              </TableRow>
            ) : notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                  No notices published in database. Click &ldquo;Post New Notice&rdquo; to broadcast an alert.
                </TableCell>
              </TableRow>
            ) : (
              notices.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="max-w-md">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Megaphone className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    {n.content && n.content !== n.title && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.content}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-indigo-400 font-semibold">
                    {n.category || 'General'}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      n.is_urgent
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {n.is_urgent ? 'URGENT FLASH' : 'NORMAL'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Active'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(n.id, n.title)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast New Notice">
        <div className="space-y-4">
          <Input
            label="Notice Headline"
            placeholder="e.g. OSSC CGL Prelims Special Marathon Session on Sunday"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notice Content / Details</label>
            <textarea
              rows={3}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Detailed announcement details, classroom numbers, timing instructions..."
              className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notice Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Admissions">Admissions & New Batches</option>
                <option value="Exams">Mock Test & Examination Schedule</option>
                <option value="Holidays">Campus Holiday Notice</option>
                <option value="General">General Circular</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority Flag</label>
              <select
                value={formIsUrgent ? 'urgent' : 'normal'}
                onChange={(e) => setFormIsUrgent(e.target.value === 'urgent')}
                className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal Announcement</option>
                <option value="urgent">Urgent / Flash Alert</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
