'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, Trash2, Mail, Phone, Search, Users, ExternalLink } from 'lucide-react';
import { getEnquiriesFromDb, updateEnquiryStatusInDb, deleteEnquiryFromDb } from '@/lib/supabase/cms-service';

export default function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getEnquiriesFromDb();
      if (data && Array.isArray(data)) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          phone: d.phone,
          email: d.email || '',
          interestedCourse: d.interested_course || 'General Inquiry',
          message: d.message || 'No message provided',
          source: d.source || 'Website Form',
          status: d.status || 'NEW',
          createdAt: d.created_at,
        }));
        setEnquiries(formatted);
      } else {
        setEnquiries([]);
      }
    } catch (e: any) {
      console.error('Failed to load enquiries:', e);
      setFeedback({ type: 'error', message: 'Failed to fetch inquiries from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    const res = await updateEnquiryStatusInDb(id, newStatus);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to update status' });
      await loadEnquiries();
    } else {
      setFeedback({ type: 'success', message: `Lead status updated to ${newStatus}` });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove inquiry for "${name}"?`)) return;
    const res = await deleteEnquiryFromDb(id);
    if (res.success) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setFeedback({ type: 'success', message: 'Lead removed from database' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete lead' });
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.interestedCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

  const mapStatusToBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <StatusBadge status="urgent" label="NEW LEAD" size="sm" />;
      case 'CONTACTED':
        return <StatusBadge status="warning" label="CONTACTED" size="sm" />;
      case 'FOLLOW_UP':
        return <StatusBadge status="warning" label="FOLLOW UP" size="sm" />;
      case 'CONVERTED':
        return <StatusBadge status="live" label="CONVERTED" size="sm" />;
      case 'CLOSED':
        return <StatusBadge status="inactive" label="CLOSED" size="sm" />;
      default:
        return <StatusBadge status="draft" label={status} size="sm" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Leads & Inquiries CRM"
        description="Real-time prospective student inquiries submitted via public portal, mobile app, and counselor hotline."
        statusPill={<StatusBadge status="live" label="LIVE CRM PIPELINE" size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadEnquiries}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Sync Database
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
            placeholder="Search prospect name, phone, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses ({enquiries.length})</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {filteredEnquiries.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Prospect Name &amp; Contact</TableHead>
                <TableHead>Target Program</TableHead>
                <TableHead>Inquiry Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{enq.name}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {enq.phone && (
                        <a
                          href={`tel:${enq.phone}`}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors font-mono"
                        >
                          <Phone className="h-3 w-3" />
                          {enq.phone}
                        </a>
                      )}
                      {enq.email && (
                        <a
                          href={`mailto:${enq.email}`}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          {enq.email}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {enq.interestedCourse}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed truncate">
                      {enq.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {enq.source}
                    </span>
                  </TableCell>
                  <TableCell>{mapStatusToBadge(enq.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        aria-label={`Update status for ${enq.name}`}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="FOLLOW_UP">FOLLOW UP</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enq.id, enq.name)}
                        className="text-slate-400 hover:text-rose-600 h-7 w-7 p-0 inline-flex items-center justify-center"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={Users}
            title={searchQuery || statusFilter !== 'ALL' ? 'No Matching Inquiries' : 'No Admission Leads Yet'}
            description={
              searchQuery || statusFilter !== 'ALL'
                ? 'Try changing your search query or status filter.'
                : 'Prospective student inquiries submitted via the OCI public website or mobile app will appear here instantly.'
            }
            actionLabel={searchQuery || statusFilter !== 'ALL' ? 'Clear Filters' : 'Refresh Inquiries'}
            onAction={
              searchQuery || statusFilter !== 'ALL'
                ? () => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }
                : loadEnquiries
            }
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading inquiries from database...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
