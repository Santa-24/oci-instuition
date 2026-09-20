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
import { Course } from '@/lib/types/admin';
import { Layers, Plus, RefreshCw, Trash2, BookOpen } from 'lucide-react';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  courseId?: string;
  courseName: string;
  createdAt?: string;
}

export default function SubjectsAdminPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCourseId, setFormCourseId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subjList, courseList] = await Promise.all([
        AcademicService.getSubjects(),
        AcademicService.getCourses(),
      ]);
      setSubjects(subjList);
      setCourses(courseList);
      if (courseList.length > 0 && !formCourseId) {
        setFormCourseId(courseList[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load subjects from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createSubject({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        courseId: formCourseId || undefined,
      });
      await fetchData();
      setFormName('');
      setFormCode('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Subject module created successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create subject' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await AcademicService.deleteSubject(subjectToDelete.id);
      setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id));
      setFeedback({ type: 'success', message: `Subject module "${subjectToDelete.name}" deleted.` });
      setSubjectToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete subject' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects & Syllabus Modules"
        description="Curriculum subject modules mapped to courses, question banks, and lecture series."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {subjects.length} Modules
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
          Add Subject Module
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
              <TableHead>Module Code</TableHead>
              <TableHead>Subject Title</TableHead>
              <TableHead>Associated Course Track</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-bold text-xs text-foreground">
                  {s.code}
                </TableCell>
                <TableCell className="font-bold text-foreground text-xs">
                  {s.name}
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {s.courseName || 'General Curriculum'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSubjectToDelete(s)}
                    title="Delete Subject"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <EmptyState
                    icon={<Layers className="h-6 w-6 text-muted-foreground" />}
                    title="No Subject Modules Configured"
                    description="Register discipline modules like Quantitative Aptitude, Odisha GK, or Logical Reasoning."
                    actionLabel="Add Subject Module"
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
        title="Add Subject Discipline Module"
        description="Maps an academic subject to courses, questions, and lecture archives."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject Module Title"
            placeholder="e.g. Odisha History, Geography & Culture"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. OCI-SUB-ODGK"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
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
              <option value="">General (All Streams)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
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
              Save Subject Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={confirmDeleteSubject}
        title="Delete Subject Module"
        message="Are you sure you want to delete this subject module? Any questions or notes mapped to it may become unlinked."
        entityName={subjectToDelete?.name}
        confirmLabel="Delete Subject"
      />
    </div>
  );
}
