'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Bell, Send, RefreshCw, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      return (
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.target.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [notifications, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcast Notifications & Alerts"
        description="Dispatch urgent push alerts and announcements directly to student mobile apps and portals."
        statusPill={<StatusBadge status="live" label="PUSH SYSTEM ACTIVE" size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Sync DB
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Send Broadcast
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

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications by title, body, audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredNotifications.length}</span> alerts
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {filteredNotifications.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Notification Title</TableHead>
                <TableHead>Message Body</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Delivery Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="max-w-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      <span>{n.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {n.target}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="live" label={n.deliveryCount || 'SENT'} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={Bell}
            title={searchQuery ? 'No Matching Notifications' : 'No Broadcast Notifications Logged'}
            description={
              searchQuery
                ? 'Try searching with different keywords.'
                : 'Send push notifications and urgent alerts to students enrolled across all OCI batches.'
            }
            actionLabel={searchQuery ? 'Clear Search' : 'Send Broadcast'}
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : () => setIsModalOpen(true)
            }
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading notifications from database...</span>
          </div>
        )}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message Body
            </label>
            <textarea
              rows={3}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Important notice for all aspirants..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Recipient Target Audience
            </label>
            <select
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="All Students">All Enrolled Students</option>
              <option value="SSC Aspirants">SSC CGL / CHSL Batches</option>
              <option value="Odisha Govt Aspirants">Odisha State Recruitment Batches</option>
              <option value="Railway Aspirants">Railway RRB Batches</option>
              <option value="Banking Aspirants">Banking (IBPS/SBI) Batches</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Dispatch Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
