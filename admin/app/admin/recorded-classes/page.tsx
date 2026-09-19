'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Batch } from '@/lib/types/admin';
import { Plus, Play, Trash2, RefreshCw, Video } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
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
    if (!formTitle.trim() || !formSubject.trim() || !formVideoUrl.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await AcademicService.createRecordedClass({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        videoUrl: formVideoUrl.trim(),
        durationMinutes: Number(formDuration) || 60,
      });

      setFeedback({ type: 'success', message: 'Recorded lecture published to Supabase archive!' });
      setIsModalOpen(false);
      setFormTitle('');
      setFormSubject('');
      setFormVideoUrl('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save recording' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recorded lecture?')) return;
    try {
      await AcademicService.deleteRecordedClass(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
      setFeedback({ type: 'success', message: 'Recording removed from archive.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete recording' });
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
          <h1 className="text-xl font-extrabold text-white tracking-tight">Recorded Lectures Archive</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage archived HD classroom video recordings and revisions from Supabase.
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
            Add Recording
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lecture Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordings.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell className="font-bold text-white max-w-md flex items-center gap-2">
                  <Video className="h-4 w-4 text-indigo-400" />
                  <span>{rec.title}</span>
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{rec.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{rec.batchName}</TableCell>
                <TableCell className="text-xs text-slate-400">{rec.duration}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(rec.videoUrl, '_blank')}
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                  >
                    Watch
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rec.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {recordings.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-500">
                  No recorded lectures in database. Click &quot;Add Recording&quot; to archive video classes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Recording Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Archive New Class Recording">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Lecture Title"
            placeholder="e.g. Quantitative Aptitude — Shortcut Mental Math & Series"
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
              Batch
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Video Stream URL (HLS / MP4 / YouTube)"
              placeholder="https://..."
              value={formVideoUrl}
              onChange={(e) => setFormVideoUrl(e.target.value)}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Save Recording to DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
