'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Plus, Shield, CheckCircle } from 'lucide-react';

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState([
    {
      name: 'OCI Master Administrator',
      email: 'admin@oci.edu.in',
      role: 'SUPER_ADMIN',
      status: 'Active (Supabase Auth)',
      lastLogin: 'Active Now',
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
        status: 'Invited',
        lastLogin: 'Pending Confirmation',
      },
    ]);
    setIsModalOpen(false);
    setFormName('');
    setFormEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Administrators &amp; Staff</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized staff accounts and Role-Based Access Control (RBAC) permissions.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
        >
          Add Admin Account
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Registered Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Auth Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((adm) => (
              <TableRow key={adm.email}>
                <TableCell className="font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span>{adm.name}</span>
                </TableCell>
                <TableCell className="text-xs text-slate-300 font-mono">{adm.email}</TableCell>
                <TableCell>
                  <Badge variant="primary">{adm.role}</Badge>
                </TableCell>
                <TableCell className="text-xs text-emerald-400 font-semibold">{adm.status}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="text-[10px]">
                    {adm.lastLogin}
                  </Badge>
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
            placeholder="e.g. Academic Coordinator"
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
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Security Role
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ACADEMIC_ADMIN">Academic Admin</option>
              <option value="FINANCE_ADMIN">Finance &amp; Admissions Admin</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Grant Admin Access
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
