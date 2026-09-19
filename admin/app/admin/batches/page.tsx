'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { Batch, Course } from '@/lib/types/admin';
import { Plus, RefreshCw, Trash2, Users } from 'lucide-react';

export default function BatchesAdminPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleCreateBatch = async () => {
    if (!formName.trim()) {
      setFeedback({ type: 'error', message: 'Batch name is required.' });
      return;
    }
    const targetCourseId = formCourseId || courses[0]?.id;
    if (!targetCourseId) {
      setFeedback({ type: 'error', message: 'Please create a course before creating batches.' });
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
      setFeedback({ type: 'success', message: 'Batch created successfully!' });
    } catch (err: any) {
      console.error('Failed to create batch:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to create batch' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete batch "${name}"?`)) return;
    try {
      await AcademicService.deleteBatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
      setFeedback({ type: 'success', message: `Batch "${name}" deleted.` });
    } catch (err: any) {
      console.error('Failed to delete batch:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete batch' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Batches & Rosters</h1>
          <p className="text-xs text-slate-400 mt-1">Manage batch capacity, timetable schedules, and classroom assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchBatches} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Create New Batch
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
              <TableHead>Batch Name & Course</TableHead>
              <TableHead>Schedule & Room</TableHead>
              <TableHead>Lead Faculty</TableHead>
              <TableHead>Capacity / Enrolled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading batches from database...
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No batches configured in database. Click &ldquo;Create New Batch&rdquo; to add one.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-bold text-white">{b.name}</div>
                    <div className="text-xs text-indigo-400">{b.courseName}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    <div>{b.schedule}</div>
                    <div className="text-slate-400">{b.roomName}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-300">{b.teacherName || 'Not Assigned'}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-200">
                    {b.enrolledCount} / {b.capacity} Students
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === 'ongoing' ? 'success' : 'outline'}>{b.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => handleDeleteBatch(b.id, b.name)}
                        title="Delete Batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Batch">
        <div className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. OSSC CGL Target Batch 2026"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Course</label>
            <select
              value={formCourseId}
              onChange={(e) => setFormCourseId(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Timetable Schedule"
            placeholder="Mon-Fri 08:00 AM - 01:30 PM"
            value={formSchedule}
            onChange={(e) => setFormSchedule(e.target.value)}
          />
          <Input
            label="Classroom / Hall"
            placeholder="Hall A (Smart Classroom)"
            value={formRoom}
            onChange={(e) => setFormRoom(e.target.value)}
          />
          <Input
            label="Student Capacity"
            type="number"
            placeholder="60"
            value={formCapacity}
            onChange={(e) => setFormCapacity(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateBatch} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
