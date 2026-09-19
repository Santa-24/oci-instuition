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

interface SuccessStory {
  id: string;
  studentName: string;
  exam: string;
  achievement: string;
  year: string;
  story: string;
  featured: boolean;
  published: boolean;
}

const defaultSuccess: SuccessStory[] = [
  { id: 's1', studentName: 'Priyabrata Jena', exam: 'OSSC CGL 2024', achievement: 'Rank 14 (Auditor Post)', year: '2024', story: 'OCI Bhadrak provided systematic test series and regular doubt clearing sessions that made all the difference.', featured: true, published: true },
  { id: 's2', studentName: 'Monali Sahoo', exam: 'SSC CHSL 2024', achievement: 'Selected (Postal Assistant)', year: '2024', story: 'The math shortcut techniques and daily speed tests at OCI helped me clear the cutoff in my first attempt.', featured: true, published: true },
  { id: 's3', studentName: 'Rakesh Behera', exam: 'Odisha Police SI', achievement: 'Qualified Sub-Inspector', year: '2023', story: 'From concept clarity in law/GK to physical fitness guidance, OCI stood by me continuously.', featured: true, published: true },
];

export default function SuccessStoriesCmsPage() {
  const [stories, setStories] = useState<SuccessStory[]>(defaultSuccess);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formName, setFormName] = useState('');
  const [formExam, setFormExam] = useState('');
  const [formAchieve, setFormAchieve] = useState('');
  const [formYear, setFormYear] = useState('2025');
  const [formStory, setFormStory] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('successStories', defaultSuccess);
      if (res.data && Array.isArray(res.data)) {
        setStories(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingStory(null);
    setFormName('');
    setFormExam('');
    setFormAchieve('');
    setFormYear('2025');
    setFormStory('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SuccessStory) => {
    setEditingStory(s);
    setFormName(s.studentName);
    setFormExam(s.exam);
    setFormAchieve(s.achievement);
    setFormYear(s.year);
    setFormStory(s.story);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formName) return;
    let updated: SuccessStory[];
    if (editingStory) {
      updated = stories.map((s) =>
        s.id === editingStory.id
          ? { ...s, studentName: formName, exam: formExam, achievement: formAchieve, year: formYear, story: formStory }
          : s
      );
    } else {
      updated = [
        ...stories,
        { id: 's_' + Date.now(), studentName: formName, exam: formExam, achievement: formAchieve, year: formYear, story: formStory, featured: true, published: true },
      ];
    }
    setStories(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setStories(stories.filter((s) => s.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('successStories', stories);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Student Success Stories CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage student achievements, cleared ranks, and hall of fame cards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add Success Story
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
              <TableHead>Student Name</TableHead>
              <TableHead>Exam Cleared</TableHead>
              <TableHead>Achievement / Rank</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.map((st) => (
              <TableRow key={st.id}>
                <TableCell className="font-bold text-white text-xs">{st.studentName}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{st.exam}</TableCell>
                <TableCell className="text-xs text-amber-300 font-medium">{st.achievement}</TableCell>
                <TableCell className="text-xs text-slate-400">{st.year}</TableCell>
                <TableCell>
                  <Badge variant="success">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(st)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(st.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStory ? 'Edit Success Story' : 'Add Success Story'}>
        <div className="space-y-4">
          <Input label="Student Full Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Exam Cleared (e.g. OSSC CGL, SSC CHSL, Police SI)" value={formExam} onChange={(e) => setFormExam(e.target.value)} />
          <Input label="Achievement / Rank (e.g. Rank 14, Selected)" value={formAchieve} onChange={(e) => setFormAchieve(e.target.value)} />
          <Input label="Year" value={formYear} onChange={(e) => setFormYear(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Student Quote / Testimonial</label>
            <textarea
              rows={3}
              value={formStory}
              onChange={(e) => setFormStory(e.target.value)}
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
