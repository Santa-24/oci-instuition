'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam } from '@/lib/types/admin';
import { Award, Plus, RefreshCw, Trash2, Search, HelpCircle, Trophy, BarChart2 } from 'lucide-react';

interface ExamResultItem {
  id: string;
  examId: string;
  examTitle: string;
  studentId?: string;
  student: string;
  roll: string;
  score: number;
  total: number;
  accuracy: string;
  rank: string;
  percentile: string;
  submittedAt: string;
}

export default function ResultsAdminPage() {
  const [results, setResults] = useState<ExamResultItem[]>([]);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for manual score entry
  const [formExamId, setFormExamId] = useState('');
  const [formScore, setFormScore] = useState('');
  const [formTotal, setFormTotal] = useState('200');
  const [formAccuracy, setFormAccuracy] = useState('85');
  const [formRank, setFormRank] = useState('1');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resList, examList] = await Promise.all([
        AcademicService.getResults(),
        AcademicService.getExams(),
      ]);
      setResults(resList);
      setExams(examList);
      if (examList.length > 0 && !formExamId) {
        setFormExamId(examList[0].id);
      }
    } catch (e: any) {
      console.error('Failed to load results:', e);
      setFeedback({ type: 'error', message: 'Failed to fetch results from Supabase' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExamId || !formScore) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await AcademicService.createResult({
        examId: formExamId,
        score: Number(formScore),
        totalMarks: Number(formTotal) || 200,
        accuracyPercentage: Number(formAccuracy) || 80,
        airRank: Number(formRank) || 1,
        percentile: 98.5,
      });

      setFeedback({ type: 'success', message: 'Examination result successfully recorded in Supabase!' });
      setIsModalOpen(false);
      setFormScore('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record result' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await AcademicService.deleteResult(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
      setFeedback({ type: 'success', message: 'Result record deleted from Supabase.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete result.' });
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchesSearch =
        r.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.examTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesExam = selectedExamFilter === 'ALL' || r.examId === selectedExamFilter;
      return matchesSearch && matchesExam;
    });
  }, [results, searchQuery, selectedExamFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Results & Merit Lists"
        description="Real-time merit rankings, CBT scores, percentiles, and All India Ranks evaluated from Supabase."
        statusPill={<StatusBadge status="live" label="LIVE CBT EVALUATION" size="sm" />}
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
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Record Result
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, roll number, test title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Exam:</label>
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Examinations ({exams.length})</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {filteredResults.length > 0 ? (
          <Table padding="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Student Name &amp; Roll</TableHead>
                <TableHead>Test Title</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Percentile</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{res.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{res.student}</div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{res.roll}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {res.examTitle}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {res.score}
                    </span>
                    <span className="text-[11px] text-slate-400"> / {res.total}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {res.accuracy}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      {res.percentile}%ile
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResult(res.id)}
                      className="text-slate-400 hover:text-rose-600 h-7 w-7 p-0 inline-flex items-center justify-center"
                      title="Delete Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading ? (
          <EmptyState
            icon={Award}
            title={searchQuery || selectedExamFilter !== 'ALL' ? 'No Matching Examination Results' : 'No Examination Results Recorded Yet'}
            description={
              searchQuery || selectedExamFilter !== 'ALL'
                ? 'Try adjusting your search criteria or exam filter to find specific scorecards.'
                : 'Student scorecards, percentiles, and All India Ranks will appear here when CBT mock tests are evaluated.'
            }
            actionLabel={searchQuery || selectedExamFilter !== 'ALL' ? 'Reset Filters' : 'Record Test Result'}
            onAction={
              searchQuery || selectedExamFilter !== 'ALL'
                ? () => {
                    setSearchQuery('');
                    setSelectedExamFilter('ALL');
                  }
                : () => setIsModalOpen(true)
            }
            secondaryActionLabel="View Mock Exams"
            onSecondaryAction={() => (window.location.href = '/admin/mock-exams')}
          />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading scorecards from live database...</span>
          </div>
        )}
      </Card>

      {/* Record Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Student Mock Test Scorecard"
      >
        <form onSubmit={handleRecordResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Examination
            </label>
            <select
              value={formExamId}
              onChange={(e) => setFormExamId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} (Marks: {ex.totalMarks})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marks Obtained"
              type="number"
              placeholder="e.g. 175"
              value={formScore}
              onChange={(e) => setFormScore(e.target.value)}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              placeholder="200"
              value={formTotal}
              onChange={(e) => setFormTotal(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Accuracy (%)"
              type="number"
              placeholder="e.g. 88.5"
              value={formAccuracy}
              onChange={(e) => setFormAccuracy(e.target.value)}
            />
            <Input
              label="All India Rank (AIR)"
              type="number"
              placeholder="e.g. 1"
              value={formRank}
              onChange={(e) => setFormRank(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Scorecard to Live DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
