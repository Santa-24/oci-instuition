'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Bell, Send, RefreshCw } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt?: string;
  deliveryCount?: string;
}

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTarget, setFormTarget] = useState('All Students');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const list = await AcademicService.getNotifications();
      setNotifications(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load notifications' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await AcademicService.createNotification({
        title: formTitle.trim(),
        body: formBody.trim(),
        target: formTarget,
      });

      setFeedback({ type: 'success', message: 'Broadcast notification dispatched and recorded in Supabase!' });
      setIsModalOpen(false);
      setFormTitle('');
      setFormBody('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send notification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Broadcast Notifications &amp; Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch urgent push alerts and announcements directly to student mobile apps and portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Send className="h-4 w-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          >
            Send Broadcast
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification Title</TableHead>
              <TableHead>Message Body</TableHead>
              <TableHead>Recipient Group</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="font-bold text-white max-w-xs flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{n.title}</span>
                </TableCell>
                <TableCell className="text-xs text-slate-300 max-w-md line-clamp-1">{n.body}</TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{n.target}</TableCell>
                <TableCell className="text-xs text-emerald-400 font-bold">{n.deliveryCount}</TableCell>
              </TableRow>
            ))}

            {notifications.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-xs text-slate-500">
                  No broadcast notifications logged yet. Click &quot;Send Broadcast&quot; to send an alert.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Broadcast Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast Push Notification">
        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="Notification Title"
            placeholder="e.g. Weekly Full-Length Mock Test Starts Tomorrow at 9:00 AM"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Message Body
            </label>
            <textarea
              rows={3}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Important notice for all aspirants..."
              className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Recipient Target Audience
            </label>
            <select
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All Students">All Enrolled Students</option>
              <option value="SSC Aspirants">SSC CGL / CHSL Batches</option>
              <option value="Odisha Govt Aspirants">Odisha State Govt Batches</option>
              <option value="Railway Aspirants">Railway RRB Batches</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Dispatch Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
