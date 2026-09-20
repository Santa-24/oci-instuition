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
import { Batch, Course } from '@/lib/types/admin';
import {
  Layers,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function BatchesAdminPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formSchedule, setFormSchedule] = useState('Mon-Fri 08:00 AM - 01:30 PM');
  const [formRoom, setFormRoom] = useState('Hall A (Smart Classroom)');
  const [formCapacity, setFormCapacity] = useState('60');

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const [batchList, courseList] = await Promise.all([
        AcademicService.getBatches(),
        AcademicService.getCourses(),
      ]);
      setBatches(batchList);
      setCourses(courseList);
      if (courseList.length > 0 && !formCourseId) {
        setFormCourseId(courseList[0].id);
      }
    } catch (e: any) {
      console.error('Failed to load batches:', e);
      setFeedback({ type: 'error', message: 'Failed to load batches from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedback({ type: 'error', message: 'Batch name is required.' });
      return;
    }
    const targetCourseId = formCourseId || courses[0]?.id;
    if (!targetCourseId) {
      setFeedback({ type: 'error', message: 'Please create an academic course before creating cohort batches.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createBatch({
        name: formName.trim(),
        courseId: targetCourseId,
        schedule: formSchedule.trim() || 'Mon-Fri 08:00 AM - 01:30 PM',
        roomName: formRoom.trim() || 'Hall A',
        capacity: parseInt(formCapacity) || 60,
      });
      await fetchBatches();
      setFormName('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Cohort batch created successfully!' });
    } catch (err: any) {
      console.error('Failed to create batch:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to create batch' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await AcademicService.deleteBatch(batchToDelete.id);
      setBatches((prev) => prev.filter((b) => b.id !== batchToDelete.id));
      setFeedback({ type: 'success', message: `Batch "${batchToDelete.name}" deleted.` });
      setBatchToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete batch:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete batch' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Batches & Timetable Rosters"
        description="Active classroom cohorts, lecture hall allocations, timetable schedules, and seat limits in Bhadrak campus."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {batches.length} Active Batches
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchBatches}
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
          Create Cohort Batch
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

      {/* Batches Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort Batch Name</TableHead>
              <TableHead>Course Track</TableHead>
              <TableHead>Timetable Schedule</TableHead>
              <TableHead>Lecture Hall</TableHead>
              <TableHead>Seat Capacity Meter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((b) => {
              const capacity = b.capacity || 60;
              const enrolled = b.enrolledCount || 0;
              const percent = Math.min(100, Math.round((enrolled / capacity) * 100));

              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <p className="font-bold text-foreground text-xs">{b.name}</p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-primary">
                    {b.courseName || 'General Track'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.schedule}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.roomName}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-foreground tabular-nums">
                        <span>{enrolled} Enrolled</span>
                        <span className="text-muted-foreground font-normal">{capacity} Limit</span>
                      </div>
                      <div className="h-1.5 w-full bg-canvas-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, percent)}%` }}
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                          )}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status || 'active'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBatchToDelete(b)}
                      title="Delete Batch"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {batches.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <EmptyState
                    icon={<Layers className="h-6 w-6 text-muted-foreground" />}
                    title="No Cohort Batches Scheduled"
                    description="Setup classroom batches for upcoming examination terms with defined seat limits."
                    actionLabel="Create First Batch"
                    onAction={() => setIsModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Cohort Batch Roster"
        description="Allocates classroom hall, schedule timing, and seat enrollment threshold."
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input
            label="Cohort Batch Title"
            placeholder="e.g. Combined Central & State Morning Batch 2026-A"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Associated Academic Course Track
            </label>
            <select
              value={formCourseId}
              onChange={(e) => setFormCourseId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Timetable Schedule Window"
              placeholder="Mon-Fri 08:00 AM - 01:30 PM"
              value={formSchedule}
              onChange={(e) => setFormSchedule(e.target.value)}
              required
            />
            <Input
              label="Assigned Classroom / Hall"
              placeholder="Hall A (Smart Classroom)"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              required
            />
          </div>

          <Input
            label="Seat Enrollment Capacity Limit"
            type="number"
            min="10"
            max="120"
            placeholder="60"
            value={formCapacity}
            onChange={(e) => setFormCapacity(e.target.value)}
            required
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
              Save & Schedule Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(batchToDelete)}
        onClose={() => setBatchToDelete(null)}
        onConfirm={confirmDeleteBatch}
        title="Delete Cohort Batch"
        message="Are you sure you want to delete this cohort batch? Enrolled students will need to be reassigned."
        entityName={batchToDelete?.name}
        confirmLabel="Delete Batch"
      />
    </div>
  );
}
