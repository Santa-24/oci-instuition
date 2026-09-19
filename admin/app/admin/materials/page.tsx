'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { Batch } from '@/lib/types/admin';
import { Upload, FileText, Download, Trash2, RefreshCw } from 'lucide-react';

interface MaterialItem {
  id: string;
  title: string;
  subject: string;
  batchId?: string;
  batchName: string;
  type: string;
  fileUrl: string;
  fileSize: string;
  downloadCount: number;
  createdAt?: string;
}

export default function StudyMaterialsAdminPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formBatchId, setFormBatchId] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('2.4 MB');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matList, batchList] = await Promise.all([
        AcademicService.getMaterials(),
        AcademicService.getBatches(),
      ]);
      setMaterials(matList);
      setBatches(batchList);
      if (batchList.length > 0 && !formBatchId) {
        setFormBatchId(batchList[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch materials from Supabase' });
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
      await AcademicService.createMaterial({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        fileUrl: formFileUrl.trim() || '#',
        fileSize: formFileSize.trim(),
        type: 'PDF',
      });

      setFeedback({ type: 'success', message: 'Study material added successfully to Supabase!' });
      setIsModalOpen(false);
      setFormTitle('');
      setFormSubject('');
      setFormFileUrl('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add study material' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    try {
      await AcademicService.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setFeedback({ type: 'success', message: 'Study material deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete material' });
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
          <h1 className="text-xl font-extrabold text-white tracking-tight">Study Materials &amp; Notes (PDF)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Distribute official PDF theory modules, DPPs, and formula sheets from Supabase storage.
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
            leftIcon={<Upload className="h-4 w-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          >
            Upload Material
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Target Batch</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((mat) => (
              <TableRow key={mat.id}>
                <TableCell className="font-bold text-white max-w-md flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-400" />
                  <span>{mat.title}</span>
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{mat.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{mat.batchName}</TableCell>
                <TableCell className="text-xs text-slate-400">{mat.fileSize}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(mat.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {materials.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-500">
                  No study materials uploaded yet. Click &quot;Upload Material&quot; to publish notes to active batches.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Upload Material Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload PDF Study Material">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Quantitative Aptitude — Percentage Mastery DPP.pdf"
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="PDF File URL"
              placeholder="https://... or Storage link"
              value={formFileUrl}
              onChange={(e) => setFormFileUrl(e.target.value)}
            />
            <Input
              label="File Size"
              placeholder="e.g. 3.2 MB"
              value={formFileSize}
              onChange={(e) => setFormFileSize(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Save Material to DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
