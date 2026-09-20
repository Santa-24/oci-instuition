'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Plus, Shield, CheckCircle2, UserCheck, Mail } from 'lucide-react';

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState([
    {
      name: 'OCI Master Administrator',
      email: 'admin@oci.edu.in',
      role: 'SUPER_ADMIN',
      status: 'Active (Supabase Auth)',
      lastLogin: 'Active Now',
    },
    {
      name: 'Academic Coordinator',
      email: 'coordinator@oci.edu.in',
      role: 'ACADEMIC_ADMIN',
      status: 'Active (Supabase Auth)',
      lastLogin: 'Today, 09:30 AM',
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('ACADEMIC_ADMIN');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    setAdmins([
      ...admins,
      {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        status: 'Invited (Pending Confirmation)',
        lastLogin: 'Invitation Sent',
      },
    ]);
    setIsModalOpen(false);
    setFormName('');
    setFormEmail('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrators &amp; Staff Access"
        description="Manage authorized institutional staff accounts and Role-Based Access Control (RBAC) permissions."
        statusPill={<StatusBadge status="live" label="RBAC ENFORCED" size="sm" />}
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Admin Account
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table padding="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Staff Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Auth Status</TableHead>
              <TableHead className="text-right">Last Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((adm) => (
              <TableRow key={adm.email}>
                <TableCell>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Shield className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span>{adm.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{adm.email}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status="neutral" label={adm.role} size="sm" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{adm.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {adm.lastLogin}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Admin Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite New Administrator">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Senior Faculty Coordinator"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Staff Email"
            type="email"
            placeholder="staff@oci.edu.in"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Role
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ACADEMIC_ADMIN">Academic Administrator (Courses &amp; Classrooms)</option>
              <option value="EXAMINATION_ADMIN">Examination Administrator (CBT &amp; Results)</option>
              <option value="CONTENT_ADMIN">Content &amp; Website CMS Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator (Full Master Privileges)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Grant Admin Access
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
