'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Batch } from '@/lib/types/admin';
import { Plus, ClipboardList, Trash2, RefreshCw } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
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
    if (!formTitle.trim() || !formSubject.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await AcademicService.createAssignment({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        description: formDescription.trim() || undefined,
        dueDate: formDueDate || undefined,
      });

      setFeedback({ type: 'success', message: 'Assignment created successfully in Supabase!' });
      setIsModalOpen(false);
      setFormTitle('');
      setFormSubject('');
      setFormDescription('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create assignment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await AcademicService.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setFeedback({ type: 'success', message: 'Assignment deleted from Supabase.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete assignment' });
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
          <h1 className="text-xl font-extrabold text-white tracking-tight">Assignments &amp; Submissions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create homework assignments, set due dates, and monitor student work in Supabase.
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
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          >
            Create Assignment
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Target Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((asg) => (
              <TableRow key={asg.id}>
                <TableCell className="font-bold text-white max-w-md flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-indigo-400" />
                  <span>{asg.title}</span>
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{asg.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{asg.batchName}</TableCell>
                <TableCell>
                  <Badge variant={asg.status === 'active' ? 'success' : 'outline'}>
                    {asg.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(asg.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {assignments.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-500">
                  No assignments created yet. Click &quot;Create Assignment&quot; to assign tasks to active batches.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Batch Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assignment Title"
            placeholder="e.g. Weekly Speed Arithmetic Problem Set #01"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <Input
            label="Subject"
            placeholder="e.g. Quantitative Aptitude"
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Batch
            </label>
            <select
              value={formBatchId}
              onChange={(e) => setFormBatchId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Assignment Instructions / Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Detailed instructions for students..."
              className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Create Assignment in DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
