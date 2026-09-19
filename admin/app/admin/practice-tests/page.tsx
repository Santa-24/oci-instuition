'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam } from '@/lib/types/admin';
import { Plus, HelpCircle, RefreshCw, Eye } from 'lucide-react';

export default function PracticeTestsAdminPage() {
  const [tests, setTests] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const list = await AcademicService.getExams();
      setTests(list);
    } catch (e) {
      console.error('Failed to load practice tests:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Practice Tests &amp; Quizzes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Topic-wise daily quizzes, mock drills, and CBT practice assessments loaded from Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Link href="/admin/mock-exams">
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            >
              Create CBT Exam
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Target Program</TableHead>
              <TableHead>Duration &amp; Marks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  <span>{t.title}</span>
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{t.courseName}</TableCell>
                <TableCell className="text-xs text-slate-300">
                  {t.durationMinutes} mins • {t.totalMarks} Marks
                </TableCell>
                <TableCell>
                  <Badge variant={t.isPublished ? 'success' : 'outline'}>
                    {t.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href="/admin/mock-exams">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      Manage
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {tests.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-500">
                  No practice tests found in database. Click &quot;Create CBT Exam&quot; to publish a test.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
