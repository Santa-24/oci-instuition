'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function PracticeTestsAdminPage() {
  const tests = [
    { title: 'Electrostatics DPP Quiz 1', subject: 'Physics', questions: 15, duration: '30 mins', attempts: 42 },
    { title: 'Chemical Kinetics Speed Drill', subject: 'Chemistry', questions: 20, duration: '40 mins', attempts: 38 },
    { title: 'Vectors & 3D Geometry Quick Test', subject: 'Mathematics', questions: 15, duration: '30 mins', attempts: 40 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Practice Tests & Quizzes</h1>
          <p className="text-xs text-slate-400 mt-1">Topic-wise daily quizzes and rapid practice assessments.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Create Practice Test
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Questions / Duration</TableHead>
              <TableHead>Student Attempts</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((t) => (
              <TableRow key={t.title}>
                <TableCell className="font-bold text-white">{t.title}</TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{t.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{t.questions} Qs • {t.duration}</TableCell>
                <TableCell className="text-xs font-bold text-emerald-400">{t.attempts} Attempts</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Submissions
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
