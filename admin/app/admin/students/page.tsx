'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { Student, Batch } from '@/lib/types/admin';
import { Plus, Search, Eye, RefreshCw, Trash2 } from 'lucide-react';

export default function StudentsAdminPage() {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const filtered = students.filter((s) => {
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

  const handleEnroll = async () => {
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
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Student enrolled successfully!' });
    } catch (err: any) {
      console.error('Failed to enroll student:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to enroll student' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove student record for "${name}"?`)) return;
    try {
      await AcademicService.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: 'success', message: `Student "${name}" removed.` });
    } catch (err: any) {
      console.error('Failed to delete student:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete student' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage OCI competitive aspirants, enrollments, batch assignments, and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchData} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Enroll New Student
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by aspirant name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="h-10 rounded-md border border-slate-800 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name & Roll No</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avg Mock Score</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading students from database...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No students found. Click &ldquo;Enroll New Student&rdquo; to add aspirants to the institute.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.rollNo} • {s.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-indigo-400 font-semibold">{s.batchName || 'General / Unassigned'}</TableCell>
                  <TableCell>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Enrolled
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-200">
                    {s.avgMockScore > 0 ? `${s.avgMockScore} pts` : 'No tests yet'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{s.admissionDate || 'Today'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Student"
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

      {/* Enroll Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enroll New Aspirant">
        <div className="space-y-4">
          <Input label="Student Full Name" placeholder="e.g. Subham Dash" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Roll Number" placeholder="e.g. OCI-2026-855" value={formRoll} onChange={(e) => setFormRoll(e.target.value)} />
          <Input label="Email Address" placeholder="e.g. subham@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          <Input label="Phone Number" placeholder="+91 98765 00000" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assign Batch (Optional)</label>
            <select
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- No Batch (General Admission) --</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.courseName})
                </option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleEnroll} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Enrollment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
