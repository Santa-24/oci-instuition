'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Play } from 'lucide-react';

export default function RecordedClassesAdminPage() {
  const recordings = [
    { title: 'Electrostatics Lecture 1: Coulomb Law & Electric Fields', subject: 'Physics', batch: 'JEE Alpha', duration: '1h 15m', views: 42 },
    { title: 'Electrostatics Lecture 2: Electric Dipoles & Flux', subject: 'Physics', batch: 'JEE Alpha', duration: '1h 22m', views: 39 },
    { title: 'Chemical Thermodynamics Lecture 1: First Law', subject: 'Chemistry', batch: 'JEE Alpha', duration: '1h 10m', views: 41 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Recorded Lectures Archive</h1>
          <p className="text-xs text-slate-400 mt-1">Manage archived HD class video streams for student revision.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Lecture Recording
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lecture Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Student Views</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordings.map((rec) => (
              <TableRow key={rec.title}>
                <TableCell className="font-bold text-white max-w-md">{rec.title}</TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{rec.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{rec.batch}</TableCell>
                <TableCell className="text-xs text-slate-400">{rec.duration}</TableCell>
                <TableCell className="text-xs font-bold text-emerald-400">{rec.views} Views</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" leftIcon={<Play className="h-3.5 w-3.5" />}>
                    Preview
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
