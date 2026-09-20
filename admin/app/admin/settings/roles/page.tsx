'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ShieldCheck, Lock } from 'lucide-react';

export default function RolesSettingsPage() {
  const roles = [
    {
      role: 'SUPER_ADMIN',
      description: 'Master access across all academic entities, database configurations, and staff accounts.',
      scope: 'Global Master Privileges',
      status: 'active',
    },
    {
      role: 'ACADEMIC_ADMIN',
      description: 'Full management of courses, batches, syllabus subjects, study materials, and faculty rosters.',
      scope: 'Academics & Classroom',
      status: 'active',
    },
    {
      role: 'EXAMINATION_ADMIN',
      description: 'Can author questions in Question Bank, publish CBT mock exams, and manage scorecards.',
      scope: 'Assessments & Merit Lists',
      status: 'active',
    },
    {
      role: 'CONTENT_ADMIN',
      description: 'Authority to edit Website CMS, announcement boards, director message, and media library.',
      scope: 'Website CMS & Portal',
      status: 'active',
    },
    {
      role: 'TEACHER_ADMIN',
      description: 'Can host live classrooms, view enrolled students, record daily attendance, and assign problem sets.',
      scope: 'Classroom & Attendance',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles &amp; Permissions Matrix"
        description="Granular Role-Based Access Control (RBAC) enforced at Supabase database RLS and API middleware layers."
        statusPill={<StatusBadge status="live" label="SECURITY POLICY ACTIVE" size="sm" />}
      />

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table padding="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Role Identifier</TableHead>
              <TableHead>Operational Scope</TableHead>
              <TableHead>Permissions &amp; Capabilities</TableHead>
              <TableHead className="text-right">Policy Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.role}>
                <TableCell>
                  <StatusBadge status="neutral" label={r.role} size="sm" />
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                    {r.scope}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                  {r.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ENFORCED</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
