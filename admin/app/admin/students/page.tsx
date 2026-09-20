'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { AcademicService } from '@/lib/services/academic-service';
import { Student, Batch } from '@/lib/types/admin';
import {
  Users,
  Plus,
  Search,
  Eye,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBatch, setFormBatch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentData, batchData] = await Promise.all([
        AcademicService.getStudents(),
        AcademicService.getBatches(),
      ]);
      setStudents(studentData);
      setBatches(batchData);
      if (batchData.length > 0 && !formBatch) {
        setFormBatch(batchData[0].id);
      }
    } catch (e: any) {
      console.error('Failed to load student directory:', e);
      setFeedback({ type: 'error', message: 'Failed to load students or batches from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesBatch =
      selectedBatch === 'ALL' ||
      s.batchId === selectedBatch ||
      s.batchName === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRoll.trim()) {
      setFeedback({ type: 'error', message: 'Full name and Roll number are required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createStudent({
        name: formName.trim(),
        rollNo: formRoll.trim(),
        email: formEmail.trim() || `${formRoll.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@student.oci.edu`,
        phone: formPhone.trim() || '+91 99999 00000',
        batchId: formBatch || undefined,
      });
      await fetchData();
      setFormName('');
      setFormRoll('');
      setFormEmail('');
      setFormPhone('');
      setIsEnrollModalOpen(false);
      setFeedback({ type: 'success', message: 'Student enrolled successfully into Supabase!' });
    } catch (err: any) {
      console.error('Failed to enroll student:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to enroll student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await AcademicService.deleteStudent(studentToDelete.id);
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      if (selectedStudentForDrawer?.id === studentToDelete.id) {
        setSelectedStudentForDrawer(null);
      }
      setFeedback({ type: 'success', message: `Student record "${studentToDelete.name}" removed.` });
      setStudentToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete student:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete student' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Aspirant Directory"
        description="Enrolled candidates, competitive examination streams, cohort allocations, and academic dossiers."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {students.length} Registered
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
          onClick={() => setIsEnrollModalOpen(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="text-xs"
        >
          Enroll Aspirant
        </Button>
      </PageHeader>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or registered email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-subtle"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Layers className="h-4 w-4 text-muted-foreground hidden sm:inline" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="ALL">All Cohort Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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

      {/* Table-First Directory */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll Number</TableHead>
              <TableHead>Candidate Identity</TableHead>
              <TableHead>Contact & Phone</TableHead>
              <TableHead>Batch Cohort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-bold text-xs text-foreground">
                  {s.rollNo}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {s.phone || 'N/A'}
                </TableCell>
                <TableCell className="text-xs font-semibold text-foreground">
                  {s.batchName || 'General Roster'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status || 'active'} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedStudentForDrawer(s)}
                      title="Quick Inspect"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/admin/students/${s.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Open Full Dossier"
                        className="h-8 w-8 p-0 text-primary"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStudentToDelete(s)}
                      title="Remove Student Record"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<Users className="h-6 w-6 text-muted-foreground" />}
                    title={search ? 'No Matching Student Records' : 'No Students Enrolled Yet'}
                    description={
                      search
                        ? 'Try modifying your search keywords or clearing batch cohort filters.'
                        : 'Enroll candidate aspirants to assign them to batches and timetable rosters.'
                    }
                    actionLabel={search ? undefined : 'Enroll First Student'}
                    onAction={search ? undefined : () => setIsEnrollModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Contextual Student Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedStudentForDrawer)}
        onClose={() => setSelectedStudentForDrawer(null)}
        title={selectedStudentForDrawer?.name || 'Student Record'}
        description={`Roll Number: ${selectedStudentForDrawer?.rollNo || ''}`}
        width="md"
      >
        {selectedStudentForDrawer && (
          <div className="space-y-6 text-xs">
            {/* Quick Profile Summary */}
            <div className="p-4 rounded-xl border border-border bg-canvas-subtle/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground uppercase text-[10px]">Academic Standing</span>
                <StatusBadge status={selectedStudentForDrawer.status || 'active'} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[10px] text-muted-foreground">Assigned Cohort</p>
                  <p className="font-bold text-foreground text-xs mt-0.5">{selectedStudentForDrawer.batchName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Registered Phone</p>
                  <p className="font-bold text-foreground text-xs mt-0.5">{selectedStudentForDrawer.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground">Official Email Address</p>
                  <p className="font-mono font-semibold text-foreground text-xs mt-0.5">{selectedStudentForDrawer.email}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-border">
              <Link href={`/admin/students/${selectedStudentForDrawer.id}`} className="flex-1">
                <Button variant="primary" size="sm" className="w-full text-xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                  Open Full Academic Dossier
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setStudentToDelete(selectedStudentForDrawer);
                  setSelectedStudentForDrawer(null);
                }}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student Aspirant"
        description="Provisions student profile, assigns academic roll number, and maps cohort roster."
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          <Input
            label="Student Full Name"
            placeholder="e.g. Subhashree Mohapatra"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Roll Number"
            placeholder="e.g. OCI-2026-0104"
            value={formRoll}
            onChange={(e) => setFormRoll(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone Number"
              placeholder="+91 94371 23456"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <Input
              label="Email Address"
              placeholder="candidate@gmail.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Assign Cohort Batch
            </label>
            <select
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="">No Batch Assigned Yet</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.enrolledCount || 0}/{b.capacity || 60} Seats)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Save & Enroll Aspirant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
        title="Remove Student Record"
        message="Are you sure you want to permanently remove this student record from the institution database?"
        entityName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.rollNo})` : undefined}
        confirmLabel="Delete Student"
      />
    </div>
  );
}
