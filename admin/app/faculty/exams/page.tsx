'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/lib/supabase/client';
import { Plus, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function FacultyExamsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formQ, setFormQ] = useState('');
  const [formSubject, setFormSubject] = useState('Reasoning');
  const [formOpt0, setFormOpt0] = useState('');
  const [formOpt1, setFormOpt1] = useState('');
  const [formOpt2, setFormOpt2] = useState('');
  const [formOpt3, setFormOpt3] = useState('');
  const [formExp, setFormExp] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('questions').select('*').limit(20);
      if (data && data.length > 0) setQuestions(data);
    }
    load();
  }, []);

  const handleCreate = async () => {
    if (!formQ.trim()) return;
    const newQ = {
      subject: formSubject,
      topic: 'Aptitude Practice',
      question: formQ,
      options: [formOpt0 || 'Option A', formOpt1 || 'Option B', formOpt2 || 'Option C', formOpt3 || 'Option D'],
      correct_option_index: 0,
      explanation: formExp || 'Detailed solution',
      marks: 4,
      negative_marks: 1,
    };

    try {
      await supabase.from('questions').insert(newQ);
      const { data } = await supabase.from('questions').select('*').limit(20);
      if (data) setQuestions(data);
    } catch (_) {
      setQuestions([newQ, ...questions]);
    }
    setIsModalOpen(false);
    setFormQ('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Question Authoring & Test Bank</h1>
          <p className="text-xs text-slate-400 mt-1">
            Author multiple choice questions, set negative mark weights, and contribute to OCI CBT mock tests.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Add Question to Bank
        </Button>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Author New Examination Question">
          <div className="space-y-4">
            <Input label="Subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} required />
            <Input label="Question Prompt" placeholder="Type question..." value={formQ} onChange={(e) => setFormQ(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Option A (Correct Key)" placeholder="Option A" value={formOpt0} onChange={(e) => setFormOpt0(e.target.value)} required />
              <Input label="Option B" placeholder="Option B" value={formOpt1} onChange={(e) => setFormOpt1(e.target.value)} required />
              <Input label="Option C" placeholder="Option C" value={formOpt2} onChange={(e) => setFormOpt2(e.target.value)} />
              <Input label="Option D" placeholder="Option D" value={formOpt3} onChange={(e) => setFormOpt3(e.target.value)} />
            </div>
            <Input label="Detailed Explanation" placeholder="Step-by-step logic..." value={formExp} onChange={(e) => setFormExp(e.target.value)} />
            <Button className="w-full" onClick={handleCreate}>
              Save Question to Live Database
            </Button>
          </div>
        </Modal>
      )}

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question & Options</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Correct Key</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, idx) => (
              <TableRow key={q.id || idx}>
                <TableCell className="font-bold text-white text-xs max-w-md">
                  {q.question}
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">
                  {q.subject}
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  +{q.marks || 4} / -{q.negative_marks || 1}
                </TableCell>
                <TableCell>
                  <Badge variant="success">Option 1</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
