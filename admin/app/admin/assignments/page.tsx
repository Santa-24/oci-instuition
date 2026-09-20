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
import { Batch } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import {
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  Calendar,
} from 'lucide-react';

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  batchId?: string;
  batchName: string;
  dueDate?: string;
  status: string;
  createdAt?: string;
}

export default function AssignmentsAdminPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AssignmentItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formBatchId, setFormBatchId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [asgList, batchList] = await Promise.all([
        AcademicService.getAssignments(),
        AcademicService.getBatches(),
      ]);
      setAssignments(asgList);
      setBatches(batchList);
      if (batchList.length > 0 && !formBatchId) {
        setFormBatchId(batchList[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load assignments' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createAssignment({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        description: formDescription.trim(),
        dueDate: formDueDate || undefined,
      });
      await fetchData();
      setFormTitle('');
      setFormDescription('');
      setFormDueDate('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Homework assignment published!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create assignment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await AcademicService.deleteAssignment(itemToDelete.id);
      setAssignments((prev) => prev.filter((a) => a.id !== itemToDelete.id));
      setFeedback({ type: 'success', message: `Assignment "${itemToDelete.title}" removed.` });
      setItemToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete assignment' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Assignments & Problem Sets"
        description="Homework question sets, submission deadlines, and topic-wise self-evaluation tasks."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {assignments.length} Problem Sets
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchData}
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
          Publish Assignment
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

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment Title</TableHead>
              <TableHead>Subject Discipline</TableHead>
              <TableHead>Cohort Batch</TableHead>
              <TableHead>Submission Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{a.description || 'No special instructions'}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {a.subject}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {a.batchName || 'Open Distribution'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {a.dueDate ? formatDateTime(a.dueDate) : 'Open Ended'}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={a.status || 'active'} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setItemToDelete(a)}
                    title="Remove Assignment"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<FileText className="h-6 w-6 text-muted-foreground" />}
                    title="No Problem Sets Assigned"
                    description="Distribute daily homework problem sets, practice questions, and deadline evaluations."
                    actionLabel="Create First Assignment"
                    onAction={() => setIsModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Distribute Assignment Problem Set"
        description="Publishes homework questions to student portals with evaluation timeline."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assignment Title"
            placeholder="e.g. Daily Practice Sheet #14: Time, Speed & Distance"
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
              label="Submission Due Date & Time"
              type="datetime-local"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Cohort Batch
            </label>
            <select
              value={formBatchId}
              onChange={(e) => setFormBatchId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="">Open to All Enrolled Aspirants</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Instructions & Evaluation Criteria"
            placeholder="Solve all 25 MCQs. Rough work must be submitted in class."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

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
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Assignment"
        message="Are you sure you want to remove this homework assignment?"
        entityName={itemToDelete?.title}
        confirmLabel="Delete Assignment"
      />
    </div>
  );
}
