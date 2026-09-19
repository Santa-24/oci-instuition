'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, Trash2, Mail, Phone, Clock } from 'lucide-react';
import { getEnquiriesFromDb, updateEnquiryStatusInDb, deleteEnquiryFromDb } from '@/lib/supabase/cms-service';

export default function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
          email: d.email || 'N/A',
          interestedCourse: d.interested_course || 'General Enquiry',
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
      setFeedback({ type: 'error', message: 'Failed to fetch enquiries' });
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
      setFeedback({ type: 'success', message: 'Lead status updated' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove lead for "${name}"?`)) return;
    const res = await deleteEnquiryFromDb(id);
    if (res.success) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setFeedback({ type: 'success', message: 'Lead removed from database' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete lead' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Admission Leads & Enquiries</h1>
          <p className="text-xs text-slate-400 mt-1">Track prospective student enquiries submitted via public website form and mobile app.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={loadEnquiries} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh Leads
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
              <TableHead>Prospect Name & Contact</TableHead>
              <TableHead>Target Course</TableHead>
              <TableHead>Inquiry Message</TableHead>
              <TableHead>Lead Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading enquiries from database...
                </TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No admission enquiries received yet. Form submissions from the public website or mobile app will appear here instantly.
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell>
                    <div className="font-bold text-white text-xs">{enq.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {enq.phone} • {enq.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-indigo-400">{enq.interestedCourse}</TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-xs leading-relaxed">{enq.message}</TableCell>
                  <TableCell className="text-xs text-slate-400">{enq.source}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        enq.status === 'NEW'
                          ? 'destructive'
                          : enq.status === 'CONVERTED'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {enq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        aria-label={`Update status for ${enq.name}`}
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="FOLLOW_UP">FOLLOW_UP</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enq.id, enq.name)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
