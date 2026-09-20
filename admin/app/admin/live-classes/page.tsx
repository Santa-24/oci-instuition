'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { AcademicService } from '@/lib/services/academic-service';
import { LiveClass, Batch } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import {
  Calendar,
  Radio,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  Layers,
  Users,
} from 'lucide-react';

export default function LiveClassesAdminPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<LiveClass | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formTeacher, setFormTeacher] = useState('OCI Faculty Lead');
  const [formBatch, setFormBatch] = useState('');

  const fetchLiveClasses = async () => {
    setIsLoading(true);
    try {
      const [classList, batchList] = await Promise.all([
        AcademicService.getLiveClasses(),
        AcademicService.getBatches(),
      ]);
      setClasses(classList);
      setBatches(batchList);
      if (batchList.length > 0 && !formBatch) {
        setFormBatch(batchList[0].id);
      }
    } catch (e) {
      console.error('Failed to load live classes:', e);
      setFeedback({ type: 'error', message: 'Failed to load classroom timetable' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFeedback({ type: 'error', message: 'Class session title is required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 90 * 60000); // 90 minutes
      await AcademicService.createLiveClass({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatch,
        scheduledStart: now.toISOString(),
        scheduledEnd: end.toISOString(),
      });
      await fetchLiveClasses();
      setFormTitle('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Live class session scheduled!' });
    } catch (err: any) {
      console.error('Failed to schedule class:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to schedule class' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      await AcademicService.deleteLiveClass(classToDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      setFeedback({ type: 'success', message: `Class session "${classToDelete.title}" removed.` });
      setClassToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete live class:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to remove class' });
    }
  };

  const liveClassesCount = classes.filter((c) => (c.status || '').toLowerCase() === 'live').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classroom Timetable & Live Stream Monitor"
        description="Schedule live Jitsi video lectures, broadcast streams to students, and monitor real-time class status."
        badge={
          liveClassesCount > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              {liveClassesCount} Currently Live
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
              {classes.length} Sessions
            </span>
          )
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchLiveClasses}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="text-xs"
        >
          Schedule Session
        </Button>
      </PageHeader>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Timetable Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Lecture & Discipline</TableHead>
              <TableHead>Cohort Batch</TableHead>
              <TableHead>Faculty Host</TableHead>
              <TableHead>Schedule Window</TableHead>
              <TableHead>Live Status</TableHead>
              <TableHead className="text-right">Room & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs">{cls.title}</p>
                    <p className="text-[11px] text-muted-foreground">{cls.subject}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {cls.batchName || 'Open Broadcast'}
                </TableCell>
                <TableCell className="text-xs text-foreground font-medium">
                  {cls.teacherName || formTeacher}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {cls.scheduledStart ? formatDateTime(cls.scheduledStart) : 'Scheduled'}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={cls.status || 'scheduled'} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {cls.roomUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(cls.roomUrl, '_blank')}
                        leftIcon={<ExternalLink className="h-3 w-3" />}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        Join Jitsi
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setClassToDelete(cls)}
                      title="Remove Class"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<Calendar className="h-6 w-6 text-muted-foreground" />}
                    title="No Live Classes Scheduled"
                    description="Schedule daily lectures for active student batches and broadcast live video conference streams."
                    actionLabel="Schedule First Class"
                    onAction={() => setIsModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Schedule Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Live Video Lecture"
        description="Creates an interactive Jitsi room and broadcasts timetable alert to student applications."
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <Input
            label="Class Lecture Title"
            placeholder="e.g. Special Marathon: Speed Mathematics & Number Systems"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Subject / Topic"
              placeholder="Quantitative Aptitude"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              required
            />
            <Input
              label="Faculty Host"
              placeholder="OCI Senior Faculty"
              value={formTeacher}
              onChange={(e) => setFormTeacher(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Target Cohort Batch
            </label>
            <select
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="">Broadcast to All Cohorts</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Schedule Lecture
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(classToDelete)}
        onClose={() => setClassToDelete(null)}
        onConfirm={confirmDeleteClass}
        title="Cancel Class Lecture"
        message="Are you sure you want to remove this scheduled lecture session?"
        entityName={classToDelete?.title}
        confirmLabel="Cancel Class"
      />
    </div>
  );
}
