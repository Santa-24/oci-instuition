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
import { MockExam, Course } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  Award,
} from 'lucide-react';

export default function MockExamsAdminPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<MockExam | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formDuration, setFormDuration] = useState('120');
  const [formMarks, setFormMarks] = useState('200');
  const [formScheduledDate, setFormScheduledDate] = useState(new Date().toISOString().slice(0, 16));

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const [examList, courseList] = await Promise.all([
        AcademicService.getExams(),
        AcademicService.getCourses(),
      ]);
      setExams(examList);
      setCourses(courseList);
      if (courseList.length > 0 && !formCourseId) {
        setFormCourseId(courseList[0].id);
      }
    } catch (e) {
      console.error('Failed to load exams:', e);
      setFeedback({ type: 'error', message: 'Failed to load CBT examinations' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createExam({
        title: formTitle.trim(),
        courseId: formCourseId || undefined,
        durationMinutes: parseInt(formDuration) || 120,
        totalMarks: parseInt(formMarks) || 200,
      });
      await fetchExams();
      setFormTitle('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'CBT examination published successfully!' });
    } catch (err: any) {
      console.error('Failed to create exam:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to create exam' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      await AcademicService.deleteExam(examToDelete.id);
      setExams((prev) => prev.filter((e) => e.id !== examToDelete.id));
      setFeedback({ type: 'success', message: `Exam "${examToDelete.title}" removed.` });
      setExamToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete exam:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete exam' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Computer-Based Mock Test (CBT) Series"
        description="Full-length timed CBT simulation tests with automated scorecards, percentile evaluation, and All India Ranks."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {exams.length} CBT Series
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchExams}
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
          Schedule CBT Mock
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

      {/* Exams Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Series Title</TableHead>
              <TableHead>Target Discipline</TableHead>
              <TableHead>Duration & Scoring</TableHead>
              <TableHead>Student Attempts</TableHead>
              <TableHead>Publication Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>
                  <p className="font-bold text-foreground text-xs">{exam.title}</p>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {exam.courseName || 'Combined Central & State'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {exam.durationMinutes} Mins • {exam.totalMarks} Marks
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-foreground tabular-nums">
                  {exam.attemptCount || 0} Submissions
                </TableCell>
                <TableCell>
                  <StatusBadge status={exam.isPublished ? 'published' : 'draft'} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExamToDelete(exam)}
                    title="Delete Exam"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<HelpCircle className="h-6 w-6 text-muted-foreground" />}
                    title="No CBT Mock Tests Scheduled"
                    description="Configure full mock tests with duration timers and total mark allocations."
                    actionLabel="Schedule First CBT Mock"
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
        title="Schedule Full CBT Mock Examination"
        description="Publishes a timed assessment to student accounts with instantaneous scorecards."
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <Input
            label="Examination Title"
            placeholder="e.g. All-Odisha OSSC CGL Prelims Full Mock Test #01"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Associated Course Stream
            </label>
            <select
              value={formCourseId}
              onChange={(e) => setFormCourseId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="">General Competitive Stream</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Exam Duration (Minutes)"
              type="number"
              placeholder="120"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              placeholder="200"
              value={formMarks}
              onChange={(e) => setFormMarks(e.target.value)}
              required
            />
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
              Schedule CBT Test
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={confirmDeleteExam}
        title="Delete CBT Mock Test"
        message="Are you sure you want to delete this CBT mock test? Any student submissions will be unlinked."
        entityName={examToDelete?.title}
        confirmLabel="Delete Exam"
      />
    </div>
  );
}
