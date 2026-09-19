'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, Download } from 'lucide-react';

export default function ResultsAdminPage() {
  const results = [
    { student: 'Ananya Roy', roll: 'OCI-2026-850', score: 262, total: 300, accuracy: '94.2%', rank: 'AIR 1', percentile: '99.92' },
    { student: 'Aarav Sharma', roll: 'OCI-2026-849', score: 248, total: 300, accuracy: '91.0%', rank: 'AIR 4', percentile: '99.45' },
    { student: 'Kabir Patel', roll: 'OCI-2026-853', score: 185, total: 300, accuracy: '78.5%', rank: 'AIR 28', percentile: '96.10' },
    { student: 'Devansh Gupta', roll: 'OCI-2026-851', score: 172, total: 300, accuracy: '72.0%', rank: 'AIR 42', percentile: '94.30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Examination Results & Scorecards</h1>
          <p className="text-xs text-slate-400 mt-1">Audit mock exam rankings, All India Ranks, percentiles, and accuracy metrics.</p>
        </div>
        <Button size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />}>
          Export Merit List
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student Name & Roll No</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Percentile</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res) => (
              <TableRow key={res.roll}>
                <TableCell className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>{res.rank}</span>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-white">{res.student}</div>
                  <div className="text-xs text-slate-400">{res.roll}</div>
                </TableCell>
                <TableCell className="text-xs font-black text-emerald-400">
                  {res.score} / {res.total}
                </TableCell>
                <TableCell className="text-xs text-slate-300">{res.accuracy}</TableCell>
                <TableCell className="text-xs font-bold text-indigo-400">{res.percentile}%ile</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Analysis
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
