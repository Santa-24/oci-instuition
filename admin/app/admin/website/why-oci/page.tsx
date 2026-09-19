'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, CheckCircle } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

interface Pillar {
  id: string;
  number: string;
  title: string;
  description: string;
}

const defaultPillars: Pillar[] = [
  { id: 'p1', number: '01', title: 'Student-Centric Approach', description: 'Every lecture, practice module, and doubt session is structured around students learning pace.' },
  { id: 'p2', number: '02', title: 'Strong Conceptual Foundation', description: 'We focus on building rock-solid fundamentals before advancing to shortcuts.' },
  { id: 'p3', number: '03', title: 'Exam-Oriented Syllabus Design', description: 'Curriculum matched to question patterns of SSC, Odisha Govt, Railway, and Banking exams.' },
  { id: 'p4', number: '04', title: 'Step-by-Step Systematic Learning', description: 'Logically organized roadmap from basics to advanced topics.' },
  { id: 'p5', number: '05', title: 'Daily Practice & Revision Routine', description: 'Daily practice worksheets, weekly tests, and revision marathons.' },
  { id: 'p6', number: '06', title: 'Supportive & Doubt-Free Environment', description: 'Approachable faculty where students ask questions freely.' },
  { id: 'p7', number: '07', title: 'Individual Attention & Guidance', description: 'One-on-one mentorship to identify student strengths and correct weaknesses.' },
  { id: 'p8', number: '08', title: 'Discipline, Confidence & Consistency', description: 'Cultivating the mindset and daily habits essential for clearing exams.' },
];

export default function WhyOciCmsPage() {
  const [pillars, setPillars] = useState<Pillar[]>(defaultPillars);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pillar | null>(null);
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('whyOci', { pillars: defaultPillars });
      if (res.data?.pillars) {
        setPillars(res.data.pillars);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNumber(`0${pillars.length + 1}`);
    setFormTitle('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Pillar) => {
    setEditingItem(p);
    setFormNumber(p.number);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formTitle) return;
    let updated: Pillar[];
    if (editingItem) {
      updated = pillars.map((p) => (p.id === editingItem.id ? { ...p, number: formNumber, title: formTitle, description: formDesc } : p));
    } else {
      updated = [...pillars, { id: 'p_' + Date.now(), number: formNumber, title: formTitle, description: formDesc }];
    }
    setPillars(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setPillars(pillars.filter((p) => p.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('whyOci', { pillars });
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Why OCI — 8 Academic Pillars</h1>
          <p className="text-xs text-slate-400 mt-1">Manage core institutional strengths displayed on the homepage and Why OCI page.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add New Pillar
          </Button>
          <Button
            size="sm"
            onClick={handlePublishAll}
            disabled={isLoading}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Published to Site!' : isLoading ? 'Saving...' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Pillar Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pillars.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs font-bold text-amber-400">{p.number}</TableCell>
                <TableCell className="font-bold text-white text-xs">{p.title}</TableCell>
                <TableCell className="text-xs text-slate-300 max-w-md leading-relaxed">{p.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Academic Pillar' : 'Add New Academic Pillar'}>
        <div className="space-y-4">
          <Input label="Pillar Index Number (e.g. 01, 02)" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} />
          <Input label="Pillar Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Pillar Explanation / Value Proposition</label>
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
