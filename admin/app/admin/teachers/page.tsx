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
import { Teacher } from '@/lib/types/admin';
import {
  GraduationCap,
  Plus,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  Award,
  Search,
} from 'lucide-react';

const OCI_FACULTY_SPECIALIZATIONS = [
  'Quantitative Aptitude & Advanced Mathematics',
  'Logical Reasoning & Analytical Ability',
  'General Studies & Indian Polity',
  'Odisha GK, History, Geography & Culture',
  'English Language & Verbal Comprehension',
  'Current Affairs & Static General Knowledge',
  'Computer Awareness & Information Technology',
  'Banking Awareness & Financial Economics',
];

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formSubject, setFormSubject] = useState(OCI_FACULTY_SPECIALIZATIONS[0]);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formQualification, setFormQualification] = useState('M.A. / M.Sc / Competitive Mentor');

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getTeachers();
      setTeachers(data);
    } catch (e: any) {
      console.error('Failed to load faculty:', e);
      setFeedback({ type: 'error', message: 'Failed to load faculty from database' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
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
        email: formEmail.trim() || `${formEmpId.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@oci.edu.in`,
        phone: formPhone.trim() || '+91 94370 00000',
        subject: formSubject,
        qualification: formQualification.trim(),
      });
      await fetchTeachers();
      setFormName('');
      setFormEmpId('');
      setFormEmail('');
      setFormPhone('');
      setIsAddModalOpen(false);
      setFeedback({ type: 'success', message: 'Faculty member registered successfully!' });
    } catch (err: any) {
      console.error('Failed to add teacher:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to register faculty' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      await AcademicService.deleteTeacher(teacherToDelete.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacherToDelete.id));
      setFeedback({ type: 'success', message: `Faculty member "${teacherToDelete.name}" removed.` });
      setTeacherToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete teacher:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to remove faculty' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Mentors & Educators"
        description="Competitive mentors, subject specializations, employee credentials, and cohort teaching assignments."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {teachers.length} Faculty Members
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={fetchTeachers}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="text-xs"
        >
          Add Faculty Mentor
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by faculty name, employee ID, or subject specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-subtle"
          />
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
              <TableHead>Employee ID</TableHead>
              <TableHead>Faculty Mentor</TableHead>
              <TableHead>Subject Specialization</TableHead>
              <TableHead>Academic Qualification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono font-bold text-xs text-foreground">
                  {t.employeeId}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {t.subject}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {t.qualification || 'Senior Competitive Faculty'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status || 'active'} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTeacherToDelete(t)}
                    title="Remove Faculty Member"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredTeachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<GraduationCap className="h-6 w-6 text-muted-foreground" />}
                    title={search ? 'No Matching Faculty Mentors' : 'No Faculty Members Registered'}
                    description={
                      search
                        ? 'Try modifying your search criteria.'
                        : 'Register competitive mentors to assign them to batches, lectures, and live sessions.'
                    }
                    actionLabel={search ? undefined : 'Add Faculty Member'}
                    onAction={search ? undefined : () => setIsAddModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Faculty Mentor"
        description="Provisions teacher account, maps academic discipline, and assigns faculty employee ID."
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <Input
            label="Full Name & Title"
            placeholder="e.g. Prof. Bikram K. Mohanty"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Employee ID (FAC-XXX)"
              placeholder="FAC-102"
              value={formEmpId}
              onChange={(e) => setFormEmpId(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              placeholder="+91 94371 99999"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Competitive Subject Discipline
            </label>
            <select
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              {OCI_FACULTY_SPECIALIZATIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Academic Qualification & Background"
            placeholder="M.Sc Mathematics / 8+ Years OPSC & SSC Mentorship"
            value={formQualification}
            onChange={(e) => setFormQualification(e.target.value)}
          />

          <Input
            label="Official Faculty Email"
            placeholder="mentor@oci.edu.in"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Register Faculty Mentor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(teacherToDelete)}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={confirmDeleteTeacher}
        title="Remove Faculty Member"
        message="Are you sure you want to permanently delete this faculty mentor from the institution database?"
        entityName={teacherToDelete ? `${teacherToDelete.name} (${teacherToDelete.employeeId})` : undefined}
        confirmLabel="Delete Faculty"
      />
    </div>
  );
}
