'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AcademicService } from '@/lib/services/academic-service';
import { AuditLog } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import { ShieldCheck } from 'lucide-react';

export default function AuditLogsSettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadLogs() {
      const data = await AcademicService.getAuditLogs();
      setLogs(data);
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Security & Financial Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable record of financial transactions, exam publication events, and permissions changes.</p>
        </div>
        <Badge variant="success" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>CRYPTOGRAPHIC LOGGING ACTIVE</span>
        </Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Action Event</TableHead>
              <TableHead>Entity & Target ID</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-bold text-white text-xs">{log.adminName}</TableCell>
                <TableCell>
                  <Badge variant="primary" className="font-mono text-[10px]">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-300 font-mono">
                  {log.entityType} ({log.entityId})
                </TableCell>
                <TableCell className="text-xs text-slate-300 max-w-sm">{log.details}</TableCell>
                <TableCell className="text-xs text-slate-400 font-mono">{log.ipAddress}</TableCell>
                <TableCell className="text-xs text-slate-400">{formatDateTime(log.timestamp)}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-xs text-slate-500">
                  No system audit logs recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
