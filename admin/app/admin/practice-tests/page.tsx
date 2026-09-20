'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam } from '@/lib/types/admin';
import { Plus, HelpCircle, RefreshCw, Eye, Search, Clock, Award, BookOpen } from 'lucide-react';

export default function PracticeTestsAdminPage() {
  const [tests, setTests] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      return (
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.courseName && t.courseName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [tests, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Tests & Topic Quizzes"
        description="Daily practice problem sets (DPP), chapter-wise quizzes, and CBT assessments synchronized from Supabase."
        statusPill={<StatusBadge status="active" label="ASSESSMENT HUB" size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Sync Live DB
            </Button>
            <Link href="/admin/mock-exams">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Create CBT Exam
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes, tests, target courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredTests.length}</span> tests
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {filteredTests.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Target Program</TableHead>
                <TableHead>Duration &amp; Marks</TableHead>
                <TableHead>Publish Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <HelpCircle className="h-4 w-4 text-primary-500" />
                      <span>{t.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {t.courseName || 'General All Streams'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {t.durationMinutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-slate-400" />
                        {t.totalMarks} Marks
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={t.isPublished ? 'active' : 'draft'}
                      label={t.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      size="sm"
                    />
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
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={HelpCircle}
            title={searchQuery ? 'No Matching Quizzes or Tests' : 'No Practice Assessments Found'}
            description={
              searchQuery
                ? 'Try searching for a different keyword or target stream.'
                : 'Create daily practice assessments and mock series to prepare OCI aspirants for Central and State exams.'
            }
            actionLabel={searchQuery ? 'Clear Search' : 'Create CBT Exam'}
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : () => (window.location.href = '/admin/mock-exams')
            }
            secondaryActionLabel="Go to Question Bank"
            onSecondaryAction={() => (window.location.href = '/admin/question-bank')}
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading assessments from live database...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
