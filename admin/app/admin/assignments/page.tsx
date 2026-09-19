'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';

export default function AssignmentsAdminPage() {
  const [assignments, setAssignments] = useState([
    {
      id: 'asg_01',
      title: 'DPP-04: Advanced Gauss Law & Spherical Shells',
      subject: 'Physics',
      batch: 'JEE Alpha Super 30',
      dueDate: '14 Aug 2026',
      totalSubmissions: 38,
      pendingGrading: 6,
    },
    {
      id: 'asg_02',
      title: 'Organic Reaction Mechanisms: SN1 & SN2 Pathways',
      subject: 'Chemistry',
      batch: 'JEE Alpha Super 30',
      dueDate: '16 Aug 2026',
      totalSubmissions: 32,
      pendingGrading: 12,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');

  const handleCreate = () => {
    if (!formTitle.trim()) return;
    setAssignments([
      ...assignments,
      {
        id: `asg_${Date.now()}`,
        title: formTitle,
        subject: formSubject,
        batch: 'JEE Alpha Super 30',
        dueDate: '20 Aug 2026',
        totalSubmissions: 0,
        pendingGrading: 0,
      },
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Assignments & Submissions</h1>
          <p className="text-xs text-slate-400 mt-1">Create homework assignments, set due dates, and monitor student submissions.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Create Assignment
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Target Batch</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Submitted / Total</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((asg) => (
              <TableRow key={asg.id}>
                <TableCell className="font-bold text-white max-w-md">{asg.title}</TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{asg.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{asg.batch}</TableCell>
                <TableCell className="text-xs text-slate-400">{asg.dueDate}</TableCell>
                <TableCell className="text-xs font-bold text-slate-200">
                  {asg.totalSubmissions} Submissions ({asg.pendingGrading} to Grade)
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Grade Submissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Homework Assignment"
      >
        <div className="space-y-4">
          <Input label="Assignment Title" placeholder="e.g. DPP-05: Rotational Mechanics" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <Input label="Subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate}>
              Publish Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
