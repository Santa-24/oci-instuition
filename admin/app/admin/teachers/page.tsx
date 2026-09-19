'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { Teacher } from '@/lib/types/admin';
import { Plus, RefreshCw, Trash2, GraduationCap } from 'lucide-react';

const OCI_SUBJECTS = [
  'Quantitative Aptitude & Mathematics',
  'Logical Reasoning & Analytical Ability',
  'General Studies & Indian Polity',
  'Odisha GK, History & Geography',
  'English Language & Comprehension',
  'Current Affairs & Static GK',
  'Computer Awareness & IT',
  'Banking & Financial Awareness',
];

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState(OCI_SUBJECTS[0]);
  const [formEmpId, setFormEmpId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formQualification, setFormQualification] = useState('M.A. / M.Sc / Ex-Officer');

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getTeachers();
      setTeachers(data);
    } catch (e: any) {
      console.error('Failed to load teachers:', e);
      setFeedback({ type: 'error', message: 'Failed to load faculty from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAdd = async () => {
    if (!formName.trim() || !formEmpId.trim()) {
      setFeedback({ type: 'error', message: 'Faculty Name and Employee ID are required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await AcademicService.createTeacher({
        name: formName.trim(),
        employeeId: formEmpId.trim(),
        email: formEmail.trim() || `${formEmpId.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@oci.edu`,
        phone: formPhone.trim() || '+91 98765 43210',
        subject: formSubject,
        qualification: formQualification.trim() || 'Post Graduate / Competitive Mentor',
      });
      await fetchTeachers();
      setFormName('');
      setFormEmpId('');
      setFormEmail('');
      setFormPhone('');
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'Faculty member added successfully!' });
    } catch (err: any) {
      console.error('Failed to add teacher:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to add faculty member' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove faculty member "${name}"?`)) return;
    try {
      await AcademicService.deleteTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setFeedback({ type: 'success', message: `Faculty member "${name}" removed.` });
    } catch (err: any) {
      console.error('Failed to delete teacher:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete faculty member' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Faculty Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage OCI competitive mentors, subject specializations, and faculty directory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchTeachers} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Faculty Member
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
              <TableHead>Faculty Name & ID</TableHead>
              <TableHead>Subject Specialization</TableHead>
              <TableHead>Qualifications</TableHead>
              <TableHead>Assigned Batches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading faculty from database...
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No faculty records found in database. Click &ldquo;Add Faculty Member&rdquo; to create one.
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.employeeId} • {t.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-indigo-400">{t.subject}</TableCell>
                  <TableCell className="text-xs text-slate-300">{t.qualification}</TableCell>
                  <TableCell className="text-xs text-slate-400">{(t.assignedBatches || []).join(', ') || 'All Batches'}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'active' ? 'success' : 'outline'}>{t.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => handleDelete(t.id, t.name)}
                      title="Delete Faculty"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Faculty Profile"
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Prof. Alok Mahapatra" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Employee ID" placeholder="e.g. OCI-FAC-101" value={formEmpId} onChange={(e) => setFormEmpId(e.target.value)} />
          <Input label="Email Address" placeholder="mentor@oci.edu" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          <Input label="Phone Number" placeholder="+91 98765 43210" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Specialization</label>
            <select
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {OCI_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <Input label="Qualifications & Experience" placeholder="M.Sc Math, 10+ Yrs SSC/OSSC Mentorship" value={formQualification} onChange={(e) => setFormQualification(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Faculty'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
