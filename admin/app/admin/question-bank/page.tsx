'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AcademicService } from '@/lib/services/academic-service';
import { QuestionBankItem } from '@/lib/types/admin';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  RefreshCw,
} from 'lucide-react';

const OCI_QUESTION_SUBJECTS = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'General Studies & Indian Polity',
  'Odisha GK & Current Affairs',
  'English Language & Comprehension',
  'Computer & Banking Awareness',
];

export default function QuestionBankAdminPage() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Form State
  const [formQ, setFormQ] = useState('');
  const [formSubject, setFormSubject] = useState(OCI_QUESTION_SUBJECTS[0]);
  const [formTopic, setFormTopic] = useState('');
  const [formOpt0, setFormOpt0] = useState('');
  const [formOpt1, setFormOpt1] = useState('');
  const [formOpt2, setFormOpt2] = useState('');
  const [formOpt3, setFormOpt3] = useState('');
  const [formCorrectIdx, setFormCorrectIdx] = useState('0');
  const [formExp, setFormExp] = useState('');

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load question bank:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQ.trim()) return;

    const newQ = {
      subject: formSubject,
      topic: formTopic.trim() || 'General Practice',
      question: formQ.trim(),
      options: [
        formOpt0.trim() || 'Option A',
        formOpt1.trim() || 'Option B',
        formOpt2.trim() || 'Option C',
        formOpt3.trim() || 'Option D',
      ],
      correctOptionIndex: parseInt(formCorrectIdx) || 0,
      explanation: formExp.trim() || 'Official OCI competitive solution methodology.',
    };

    try {
      const created = await AcademicService.createQuestion(newQ);
      setQuestions((prev) => [created, ...prev]);
      setFormQ('');
      setFormOpt0('');
      setFormOpt1('');
      setFormOpt2('');
      setFormOpt3('');
      setFormExp('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic || '').toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Question Bank Repository"
        description="Multiple-choice questions (MCQs), marking keys, explanation notes, and CBT test pools."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
            {questions.length} Questions
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={loadQuestions}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="text-xs"
        >
          Add MCQ Question
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-subtle"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle w-full sm:w-auto shrink-0"
          >
            <option value="ALL">All Disciplines</option>
            {OCI_QUESTION_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Question Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question Stem & Options</TableHead>
              <TableHead>Subject Discipline</TableHead>
              <TableHead>Topic Area</TableHead>
              <TableHead>Marks Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((q, idx) => (
              <TableRow key={q.id || idx}>
                <TableCell className="font-mono text-xs text-muted-foreground font-bold">
                  {idx + 1}
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="space-y-1.5 py-1">
                    <p className="font-bold text-foreground text-xs leading-relaxed">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      {q.options?.map((opt, i) => (
                        <div
                          key={i}
                          className={`px-2 py-1 rounded border text-[11px] font-medium ${
                            i === q.correctOptionIndex
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold'
                              : 'border-border bg-canvas-subtle/50'
                          }`}
                        >
                          <span className="font-bold mr-1">{String.fromCharCode(65 + i)}:</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-primary">
                  {q.subject}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {q.topic || 'General Practice'}
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-foreground">
                  +{q.marks || 2} / -{q.negativeMarks || 0.5}
                </TableCell>
              </TableRow>
            ))}

            {filteredQuestions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <EmptyState
                    icon={<HelpCircle className="h-6 w-6 text-muted-foreground" />}
                    title="No Questions in Repository"
                    description="Populate multiple-choice questions with marking schemes to construct computer-based test papers."
                    actionLabel="Add First MCQ"
                    onAction={() => setIsModalOpen(true)}
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Author MCQ Question"
        description="Creates an item in the central examination pool with negative marking weights."
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Question Statement / Problem Stem
            </label>
            <textarea
              rows={3}
              value={formQ}
              onChange={(e) => setFormQ(e.target.value)}
              placeholder="e.g. In which year was the Odisha Tenancy Act enacted?"
              required
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Discipline</label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
              >
                {OCI_QUESTION_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              label="Syllabus Topic"
              placeholder="e.g. Modern Odisha History"
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">Multiple Choice Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Option A" value={formOpt0} onChange={(e) => setFormOpt0(e.target.value)} required />
              <Input placeholder="Option B" value={formOpt1} onChange={(e) => setFormOpt1(e.target.value)} required />
              <Input placeholder="Option C" value={formOpt2} onChange={(e) => setFormOpt2(e.target.value)} required />
              <Input placeholder="Option D" value={formOpt3} onChange={(e) => setFormOpt3(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Correct Option Index</label>
            <select
              value={formCorrectIdx}
              onChange={(e) => setFormCorrectIdx(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="0">Option A</option>
              <option value="1">Option B</option>
              <option value="2">Option C</option>
              <option value="3">Option D</option>
            </select>
          </div>

          <Input
            label="Detailed Solution Explanation"
            placeholder="Key concept and reasoning for student review."
            value={formExp}
            onChange={(e) => setFormExp(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save to Question Bank
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
