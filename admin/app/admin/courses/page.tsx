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
import { Course } from '@/lib/types/admin';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const OCI_ACADEMIC_CATEGORIES = [
  'Central Government',
  'State Recruitment',
  'Railways',
  'Banking',
  'Teaching',
  'Defence',
];

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState(OCI_ACADEMIC_CATEGORIES[0]);
  const [formDuration, setFormDuration] = useState('6');
  const [formDesc, setFormDesc] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getCourses();
      setCourses(data);
    } catch (e) {
      console.error('Failed to load courses:', e);
      setFeedback({ type: 'error', message: 'Failed to load courses from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFeedback({ type: 'error', message: 'Course Name and Code are required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createCourse({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        category: formCategory,
        durationMonths: parseInt(formDuration) || 6,
        description: formDesc.trim() || 'Comprehensive competitive curriculum with integrated test series.',
      });
      await fetchCourses();
      setFormName('');
      setFormCode('');
      setFormDesc('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Academic course program created successfully!' });
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to create course' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await AcademicService.deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setFeedback({ type: 'success', message: `Course "${courseToDelete.name}" deleted.` });
      setCourseToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete course' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses & Academic Streams"
        description="Comprehensive competitive curriculum tracks, duration terms, and syllabus frameworks."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {courses.length} Active Tracks
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchCourses}
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
          Create Course Track
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

      {/* Courses Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code & Title</TableHead>
              <TableHead>Examination Category</TableHead>
              <TableHead>Program Duration</TableHead>
              <TableHead>Active Batches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs">{c.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{c.code}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-canvas-subtle border border-border text-foreground">
                    {c.category}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-foreground font-semibold">
                  {c.durationMonths} Months
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {c.batchCount || 0} Cohorts
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCourseToDelete(c)}
                    title="Delete Course"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<BookOpen className="h-6 w-6 text-muted-foreground" />}
                    title="No Course Programs Registered"
                    description="Configure official competitive examination programs such as SSC CGL, Odisha Police SI, and Railway NTPC."
                    actionLabel="Create First Course"
                    onAction={() => setIsModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Academic Course Track"
        description="Creates an official institutional curriculum discipline mapped to competitive exams."
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Program Title"
            placeholder="e.g. Odisha Police SI & Combined Recruitment"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Course Code (Unique Identifier)"
              placeholder="e.g. OCI-OPSI-2026"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Exam Stream Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
              >
                {OCI_ACADEMIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Curriculum Duration (in Months)"
            type="number"
            min="1"
            max="36"
            placeholder="6"
            value={formDuration}
            onChange={(e) => setFormDuration(e.target.value)}
            required
          />

          <Input
            label="Curriculum Overview & Syllabus Focus"
            placeholder="Comprehensive coverage of GS, Odisha GK, Mathematics, and timed CBT drills."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
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
              Save Course Track
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={confirmDeleteCourse}
        title="Delete Academic Course"
        message="Are you sure you want to permanently delete this course program from the institution catalog?"
        entityName={courseToDelete ? `${courseToDelete.name} (${courseToDelete.code})` : undefined}
        confirmLabel="Delete Course"
      />
    </div>
  );
}
