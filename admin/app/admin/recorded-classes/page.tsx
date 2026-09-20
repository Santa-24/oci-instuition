'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { AcademicService } from '@/lib/services/academic-service';
import { Batch } from '@/lib/types/admin';
import {
  Video,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface RecordingItem {
  id: string;
  title: string;
  subject: string;
  batchId?: string;
  batchName: string;
  videoUrl: string;
  duration: string;
  createdAt?: string;
}

export default function RecordedClassesAdminPage() {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recToDelete, setRecToDelete] = useState<RecordingItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formBatchId, setFormBatchId] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState('60');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recList, batchList] = await Promise.all([
        AcademicService.getRecordedClasses(),
        AcademicService.getBatches(),
      ]);
      setRecordings(recList);
      setBatches(batchList);
      if (batchList.length > 0 && !formBatchId) {
        setFormBatchId(batchList[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load recorded classes' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoUrl.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createRecordedClass({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        videoUrl: formVideoUrl.trim(),
        durationMinutes: parseInt(formDuration) || 60,
      });
      await fetchData();
      setFormTitle('');
      setFormVideoUrl('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Recorded lecture archived successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload recorded class' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!recToDelete) return;
    try {
      await AcademicService.deleteRecordedClass(recToDelete.id);
      setRecordings((prev) => prev.filter((r) => r.id !== recToDelete.id));
      setFeedback({ type: 'success', message: `Lecture "${recToDelete.title}" removed.` });
      setRecToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete recording' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recorded Lecture Archives"
        description="Video lecture library, revision archives, and on-demand syllabus streaming for students."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {recordings.length} Recorded Lectures
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
          Upload Lecture URL
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
              <TableHead>Lecture Title</TableHead>
              <TableHead>Subject Discipline</TableHead>
              <TableHead>Cohort Batch</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Video Stream & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordings.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-bold text-foreground text-xs">{r.title}</p>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {r.subject}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {r.batchName || 'Open Archive'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {r.duration}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(r.videoUrl, '_blank')}
                      leftIcon={<Play className="h-3 w-3" />}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      Watch
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRecToDelete(r)}
                      title="Delete Recording"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {recordings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <EmptyState
                    icon={<Video className="h-6 w-6 text-muted-foreground" />}
                    title="No Recorded Lectures Archived"
                    description="Upload on-demand video stream links for student revision and class replays."
                    actionLabel="Upload First Lecture"
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
        title="Archive Recorded Lecture"
        description="Publishes a lecture video stream to student mobile portals."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Lecture Title"
            placeholder="e.g. Indian Polity: Fundamental Rights & Duties"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Subject / Topic"
              placeholder="General Studies"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              required
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              placeholder="60"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
            />
          </div>

          <Input
            label="Video Stream URL (YouTube Unlisted / Cloudflare Stream / HLS)"
            placeholder="https://youtu.be/..."
            value={formVideoUrl}
            onChange={(e) => setFormVideoUrl(e.target.value)}
            required
          />

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
              Save & Publish Archive
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(recToDelete)}
        onClose={() => setRecToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Lecture Recording"
        message="Are you sure you want to remove this video recording from student archives?"
        entityName={recToDelete?.title}
        confirmLabel="Delete Recording"
      />
    </div>
  );
}
