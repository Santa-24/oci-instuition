'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Course } from '@/lib/types/admin';
import { Plus, BookOpen, RefreshCw, Trash2 } from 'lucide-react';

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
      setFeedback({ type: 'error', message: err.message || 'Failed to load subjects from Supabase' });
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

      setFeedback({ type: 'success', message: 'Subject created successfully in Supabase!' });
      setIsModalOpen(false);
      setFormName('');
      setFormCode('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create subject' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await AcademicService.deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: 'success', message: 'Subject deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete subject' });
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
          <h1 className="text-xl font-extrabold text-white tracking-tight">Academic Subjects & Syllabi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage real academic subjects, module codes, and mapped courses in Supabase.
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
            Add Subject
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name</TableHead>
              <TableHead>Module Code</TableHead>
              <TableHead>Mapped Course</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>{sub.name}</span>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-300 font-semibold">{sub.code}</TableCell>
                <TableCell className="text-xs text-indigo-400 font-medium">{sub.courseName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sub.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {subjects.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-xs text-slate-500">
                  No subjects found in Supabase. Click &quot;Add Subject&quot; to configure your curriculum.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Subject Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Academic Subject">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Quantitative Aptitude"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. MATH-01"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mapped Course
            </label>
            <select
              value={formCourseId}
              onChange={(e) => setFormCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Course (Optional)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Create Subject in DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
