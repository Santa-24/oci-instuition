'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { MockExam } from '@/lib/types/admin';
import { Award, Download, Plus, RefreshCw, Trash2, HelpCircle } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for manual score entry
  const [formExamId, setFormExamId] = useState('');
  const [formStudentName, setFormStudentName] = useState('');
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

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Examination Results & Scorecards</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time merit lists, All India Ranks, percentiles, and accuracy scores from Supabase CBT evaluations.
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
            Sync Live DB
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          >
            Record Result
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student Name & Roll No</TableHead>
              <TableHead>Test Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Percentile</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>{res.rank}</span>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-white">{res.student}</div>
                  <div className="text-xs text-slate-400">{res.roll}</div>
                </TableCell>
                <TableCell className="text-xs text-slate-300 font-medium">
                  {res.examTitle}
                </TableCell>
                <TableCell className="text-xs font-black text-emerald-400">
                  {res.score} / {res.total}
                </TableCell>
                <TableCell className="text-xs text-slate-300">{res.accuracy}</TableCell>
                <TableCell className="text-xs font-bold text-indigo-400">{res.percentile}%ile</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteResult(res.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {results.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="max-w-md mx-auto space-y-3">
                    <Award className="h-10 w-10 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Examination Results Recorded Yet</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Student scorecards, percentiles, and All India Ranks will appear here automatically when mock tests are evaluated.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <Link href="/admin/mock-exams">
                        <Button variant="outline" size="sm" leftIcon={<HelpCircle className="h-3.5 w-3.5" />}>
                          View Mock Exams
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Record Test Result
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Record Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Student Mock Test Scorecard"
      >
        <form onSubmit={handleRecordResult} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Examination
            </label>
            <select
              value={formExamId}
              onChange={(e) => setFormExamId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Save Scorecard to Live DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
