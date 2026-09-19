'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam } from '@/lib/types/admin';
import { Plus, RefreshCw } from 'lucide-react';

export default function MockExamsAdminPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDuration, setFormDuration] = useState('180');
  const [formMarks, setFormMarks] = useState('300');

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getExams();
      setExams(data);
    } catch (e) {
      console.error('Failed to load exams:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async () => {
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await AcademicService.createExam({
        title: formTitle.trim(),
        durationMinutes: parseInt(formDuration) || 180,
        totalMarks: parseInt(formMarks) || 300,
      });
      await fetchExams();
      setFormTitle('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Full Mock Exams Scheduler</h1>
          <p className="text-xs text-slate-400 mt-1">Configure timed full tests, negative marking, and publish schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchExams} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Create Full Mock Exam
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Title & Target</TableHead>
              <TableHead>Duration & Marks</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Attempts / Avg Score</TableHead>
              <TableHead>Publish Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading exams from database...
                </TableCell>
              </TableRow>
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No exams created in database yet.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>
                    <div className="font-bold text-white">{ex.title}</div>
                    <div className="text-xs text-indigo-400 font-semibold">{ex.courseName}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {ex.durationMinutes} Mins • {ex.totalMarks} Marks
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{ex.totalQuestions || 0} Questions</TableCell>
                  <TableCell className="text-xs text-slate-200 font-bold">
                    {ex.attemptCount > 0 ? `${ex.attemptCount} Attempts (Avg: ${ex.avgScore})` : 'No attempts yet'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ex.isPublished ? 'success' : 'outline'}>
                      {ex.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {ex.isPublished ? 'View Results' : 'Publish Test'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Full Mock Exam">
        <div className="space-y-4">
          <Input label="Exam Title" placeholder="e.g. JEE Advanced Full Mock Test 03" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <Input label="Duration (Minutes)" type="number" placeholder="180" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} />
          <Input label="Total Marks" type="number" placeholder="300" value={formMarks} onChange={(e) => setFormMarks(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateExam} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create & Publish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
