'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { AcademicService } from '@/lib/services/academic-service';
import { AuditLog } from '@/lib/types/admin';
import { ShieldCheck, ShieldAlert, History } from 'lucide-react';

export default function AuditLogsSettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const data = await AcademicService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security &amp; Administrative Audit Trail"
        description="Immutable chronological log of administrative logins, student enrollments, exam publications, and configuration changes."
        statusPill={<StatusBadge status="live" label="AUDIT LOGGING ACTIVE" size="sm" />}
      />

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {logs.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Action Event</TableHead>
                <TableHead>Entity &amp; Target ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                    {log.adminName}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="neutral" label={log.action} size="sm" />
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {log.entityType} ({log.entityId})
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 font-mono">
                    {log.ipAddress || 'Internal'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !loading ? (
          <EmptyState
            icon={History}
            title="Audit Trail Initialized"
            description="System events, admin logins, and schema mutations will be captured and immutably appended to this trail."
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading security logs...
          </div>
        )}
      </Card>
    </div>
  );
}
