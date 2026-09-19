'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { QuestionBankItem } from '@/lib/types/admin';
import { Plus, Search, CheckCircle2 } from 'lucide-react';

export default function QuestionBankAdminPage() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formQ, setFormQ] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formTopic, setFormTopic] = useState('Mechanics');
  const [formOpt0, setFormOpt0] = useState('');
  const [formOpt1, setFormOpt1] = useState('');
  const [formOpt2, setFormOpt2] = useState('');
  const [formOpt3, setFormOpt3] = useState('');
  const [formExp, setFormExp] = useState('');

  useEffect(() => {
    async function load() {
      const data = await AcademicService.getQuestions();
      setQuestions(data);
    }
    load();
  }, []);

  const handleAddQuestion = async () => {
    if (!formQ.trim()) return;
    const newQ = {
      subject: formSubject,
      topic: formTopic,
      question: formQ,
      options: [formOpt0 || 'Option A', formOpt1 || 'Option B', formOpt2 || 'Option C', formOpt3 || 'Option D'],
      correctOptionIndex: 0,
      explanation: formExp || 'Correct conceptual solution.',
    };
    try {
      await AcademicService.createQuestion(newQ);
      const updated = await AcademicService.getQuestions();
      setQuestions(updated);
    } catch (_) {
      // Optimistic update
      setQuestions([
        ...questions,
        {
          id: `q_${Date.now()}`,
          ...newQ,
          difficulty: 'Medium',
          marks: 4,
          negativeMarks: 1,
        },
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Question Bank Repository</h1>
          <p className="text-xs text-slate-400 mt-1">Manage MCQs, answer keys, explanations, and difficulty tags.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Add Question
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question & Options</TableHead>
              <TableHead>Subject & Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Marks Scheme</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="max-w-lg">
                  <p className="font-bold text-white text-xs">{q.question}</p>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] p-1.5 rounded border ${
                          idx === q.correctOptionIndex
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        ({String.fromCharCode(65 + idx)}) {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Exp: {q.explanation}</p>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-indigo-400">{q.subject}</div>
                  <div className="text-xs text-slate-400">{q.topic}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'destructive'}>
                    {q.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-200">
                  +{q.marks} / -{q.negativeMarks}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
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
        title="Add Question to Bank"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Question Problem Statement</label>
            <textarea
              rows={3}
              value={formQ}
              onChange={(e) => setFormQ(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
            <Input label="Topic" value={formTopic} onChange={(e) => setFormTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Option A (Correct)" value={formOpt0} onChange={(e) => setFormOpt0(e.target.value)} />
            <Input label="Option B" value={formOpt1} onChange={(e) => setFormOpt1(e.target.value)} />
            <Input label="Option C" value={formOpt2} onChange={(e) => setFormOpt2(e.target.value)} />
            <Input label="Option D" value={formOpt3} onChange={(e) => setFormOpt3(e.target.value)} />
          </div>
          <Input label="Solution / Step Explanation" value={formExp} onChange={(e) => setFormExp(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddQuestion}>
              Save to Question Pool
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
