'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function RolesSettingsPage() {
  const roles = [
    { role: 'SUPER_ADMIN', description: 'Unrestricted master access to all academic, administrative, and system settings.', users: 1 },
    { role: 'ACADEMIC_ADMIN', description: 'Can create and publish courses, live classes, question banks, and mock exams.', users: 2 },
    { role: 'CONTENT_ADMIN', description: 'Can edit Website CMS copy, director message, vision statements, and why institute cards.', users: 2 },
    { role: 'TEACHER_ADMIN', description: 'Can manage teacher profiles, class schedules, and student performance rosters.', users: 4 },
    { role: 'SEO_ADMIN', description: 'Can update meta titles, canonical tags, OpenGraph images, and search keywords.', users: 1 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Roles & Permissions Matrix</h1>
        <p className="text-xs text-slate-400 mt-1">Granular role-based access control (RBAC) enforced at database and API layers.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Identifier</TableHead>
              <TableHead>Permissions & Scope</TableHead>
              <TableHead>Assigned Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.role}>
                <TableCell>
                  <Badge variant="primary">{r.role}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-300 max-w-lg">{r.description}</TableCell>
                <TableCell className="text-xs font-bold text-slate-200">{r.users} Staff Users</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
