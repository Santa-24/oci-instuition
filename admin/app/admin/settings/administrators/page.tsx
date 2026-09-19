'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield } from 'lucide-react';

export default function AdministratorsPage() {
  const admins = [
    { name: 'Prof. R. K. Agrawal', email: 'director@oci-institute.edu', role: 'SUPER_ADMIN', lastLogin: 'Today, 10:14 AM' },
    { name: 'Er. S. N. Mishra', email: 'academics@oci-institute.edu', role: 'ACADEMIC_ADMIN', lastLogin: 'Yesterday, 04:30 PM' },
    { name: 'Mrs. Jayanti Pattnaik', email: 'finance@oci-institute.edu', role: 'FINANCE_ADMIN', lastLogin: '11 Aug, 09:40 AM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Administrators & Staff</h1>
          <p className="text-xs text-slate-400 mt-1">Manage staff user accounts and permissions for command center access.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Admin Account
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Last Active</TableHead>
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
                <TableCell className="text-xs text-slate-400">{adm.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
