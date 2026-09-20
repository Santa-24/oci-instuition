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
  FileText,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';

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
  const [itemToDelete, setItemToDelete] = useState<MaterialItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
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
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch materials from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formFileUrl.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createMaterial({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatchId || undefined,
        fileUrl: formFileUrl.trim(),
        fileSize: formFileSize.trim(),
        type: 'PDF',
      });
      await fetchData();
      setFormTitle('');
      setFormFileUrl('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Study material uploaded successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload material' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await AcademicService.deleteMaterial(itemToDelete.id);
      setMaterials((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      setFeedback({ type: 'success', message: `Material "${itemToDelete.title}" removed.` });
      setItemToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete material' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials & Notes"
        description="PDF lecture handouts, formula sheets, competitive digests, and syllabus resources."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {materials.length} Documents
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
          Publish Material
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
              <TableHead>Document Title</TableHead>
              <TableHead>Subject Discipline</TableHead>
              <TableHead>Target Batch</TableHead>
              <TableHead>File Specs</TableHead>
              <TableHead className="text-right">File & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-bold text-foreground text-xs">{m.title}</p>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {m.subject}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {m.batchName || 'Open Distribution'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-canvas-subtle border border-border text-[10px] font-mono font-bold">
                    {m.type || 'PDF'}
                  </span>{' '}
                  • {m.fileSize}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {m.fileUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(m.fileUrl, '_blank')}
                        leftIcon={<Download className="h-3 w-3" />}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setItemToDelete(m)}
                      title="Remove Material"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <EmptyState
                    icon={<FileText className="h-6 w-6 text-muted-foreground" />}
                    title="No Study Materials Uploaded"
                    description="Upload revision booklets, formula handbooks, and topic notes for enrolled student cohorts."
                    actionLabel="Publish First Document"
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
        title="Publish Study Material Document"
        description="Makes document instantly available to student mobile app accounts."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Quantitative Aptitude: Complete Mensuration & Geometry Formula Booklet"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Subject / Topic"
              placeholder="Quantitative Aptitude"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              required
            />
            <Input
              label="Estimated File Size"
              placeholder="2.4 MB"
              value={formFileSize}
              onChange={(e) => setFormFileSize(e.target.value)}
            />
          </div>

          <Input
            label="Public File Download URL (PDF Storage)"
            placeholder="https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/..."
            value={formFileUrl}
            onChange={(e) => setFormFileUrl(e.target.value)}
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
              Publish Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Study Material"
        message="Are you sure you want to remove this document from student downloads?"
        entityName={itemToDelete?.title}
        confirmLabel="Delete Material"
      />
    </div>
  );
}
