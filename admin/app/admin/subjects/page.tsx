'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';

export default function SubjectsAdminPage() {
  const subjects = [
    { name: 'Physics', code: 'PHY-12', chapters: 18, lectures: 72, faculty: 'Dr. H. C. Verma' },
    { name: 'Chemistry', code: 'CHM-12', chapters: 16, lectures: 68, faculty: 'Dr. O. P. Tandon' },
    { name: 'Mathematics', code: 'MAT-12', chapters: 20, lectures: 80, faculty: 'Prof. Amit M. Agarwal' },
    { name: 'Biology', code: 'BIO-12', chapters: 22, lectures: 84, faculty: 'Dr. Neela Bakore' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Subjects & Syllabi</h1>
          <p className="text-xs text-slate-400 mt-1">Manage subjects, chapters, and faculty leads across courses.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Subject
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name & Code</TableHead>
              <TableHead>Total Chapters</TableHead>
              <TableHead>Total Lectures</TableHead>
              <TableHead>Lead Faculty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((sub) => (
              <TableRow key={sub.code}>
                <TableCell className="font-bold text-white">
                  {sub.name} <span className="text-xs text-slate-400 font-normal">({sub.code})</span>
                </TableCell>
                <TableCell className="text-xs text-slate-300">{sub.chapters} Chapters</TableCell>
                <TableCell className="text-xs text-slate-300">{sub.lectures} Lectures</TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{sub.faculty}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Manage Syllabus
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
