'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, CheckCircle } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

interface ExamItem {
  id: string;
  name: string;
  category: string;
  targetEligibility: string;
  description: string;
  isPublished: boolean;
}

const defaultExams: ExamItem[] = [
  { id: 'ssc', name: 'Staff Selection Commission (SSC)', category: 'Central Govt', targetEligibility: '10th, 12th & Graduates (CGL, CHSL, MTS, GD)', description: 'Comprehensive quantitative aptitude, reasoning, general awareness, and English coaching.', isPublished: true },
  { id: 'odisha', name: 'Odisha State Govt Exams', category: 'State Govt', targetEligibility: 'Graduates & 12th Pass (OSSC, OSSSC, Police SI/Constable)', description: 'Dedicated preparation with focus on Odisha GK, arithmetic, reasoning, and Odia grammar.', isPublished: true },
  { id: 'railways', name: 'Railway Recruitment Board (RRB)', category: 'Central Govt', targetEligibility: '10th, ITI & Graduates (NTPC, Group D, ALP)', description: 'General science, technical math, and speed reasoning practice with CBT test series.', isPublished: true },
  { id: 'banking', name: 'Banking Entrance Exams', category: 'Banking & Insurance', targetEligibility: 'Graduates (IBPS PO/Clerk, SBI PO/Clerk)', description: 'High-speed calculation shortcuts, data interpretation, and English comprehension.', isPublished: true },
  { id: 'defence', name: 'Defence & Police Services', category: 'Defence', targetEligibility: '12th & Graduates (Odisha Police, Army, Airforce)', description: 'Physical guidance along with written examination preparation and mock tests.', isPublished: true },
  { id: 'teaching', name: 'Teaching Eligibility Exams', category: 'Teaching', targetEligibility: 'B.Ed / CT / D.El.Ed (OTET, OSSTET, High School Teacher)', description: 'Child development pedagogy, subject mastery, and mock question papers.', isPublished: true },
];

export default function ExaminationsCmsPage() {
  const [exams, setExams] = useState<ExamItem[]>(defaultExams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Central Govt');
  const [formEligibility, setFormEligibility] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('exams', defaultExams);
      if (res.data && Array.isArray(res.data)) {
        setExams(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormName('');
    setFormCategory('Central Govt');
    setFormEligibility('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormName(exam.name);
    setFormCategory(exam.category);
    setFormEligibility(exam.targetEligibility);
    setFormDesc(exam.description);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formName) return;
    let updated: ExamItem[];
    if (editingExam) {
      updated = exams.map((e) => (e.id === editingExam.id ? { ...e, name: formName, category: formCategory, targetEligibility: formEligibility, description: formDesc } : e));
    } else {
      updated = [...exams, { id: 'ex_' + Date.now(), name: formName, category: formCategory, targetEligibility: formEligibility, description: formDesc, isPublished: true }];
    }
    setExams(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setExams(exams.filter((e) => e.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('exams', exams);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Competitive Examinations CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage exam categories, target eligibility, and curriculum highlights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add Examination
          </Button>
          <Button
            size="sm"
            onClick={handlePublishAll}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Published to Site!' : isLoading ? 'Saving...' : 'Publish to Live Site'}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Eligibility & Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="font-bold text-white text-xs">{ex.name}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{ex.category}</TableCell>
                <TableCell className="text-xs text-slate-300 max-w-xs">{ex.targetEligibility}</TableCell>
                <TableCell>
                  <Badge variant="success">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(ex)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ex.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExam ? 'Edit Examination' : 'Add Examination'}>
        <div className="space-y-4">
          <Input label="Examination Title" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Category (e.g. Central Govt, State Govt, Banking)" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
          <Input label="Target Eligibility" value={formEligibility} onChange={(e) => setFormEligibility(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Syllabus / Course Description</label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveModal}>Save to List</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
