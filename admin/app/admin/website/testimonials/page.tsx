'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, CheckCircle, Star } from 'lucide-react';
import { getCmsSection, saveCmsSection } from '@/lib/supabase/cms-service';

interface Testimonial {
  id: string;
  studentName: string;
  exam: string;
  testimonial: string;
  year: string;
  rating: number;
  published: boolean;
}

const defaultTestimonials: Testimonial[] = [
  { id: 't1', studentName: 'Ananya Pattnaik', exam: 'OSSC Junior Assistant', testimonial: 'The faculty at OCI Bhadrak explains every arithmetic formula with proofs and shortcuts. Truly transformative learning!', year: '2024', rating: 5, published: true },
  { id: 't2', studentName: 'Bikash Mohanty', exam: 'Railway NTPC', testimonial: 'Regular mock tests on weekends prepared me for the actual computer-based test environment with zero exam panic.', year: '2024', rating: 5, published: true },
  { id: 't3', studentName: 'Dipika Das', exam: 'Banking IBPS Clerk', testimonial: 'Great discipline, dedicated doubt-clearing sessions, and genuine mentorship from the teachers.', year: '2023', rating: 5, published: true },
];

export default function TestimonialsCmsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formName, setFormName] = useState('');
  const [formExam, setFormExam] = useState('');
  const [formText, setFormText] = useState('');
  const [formYear, setFormYear] = useState('2025');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('testimonials', defaultTestimonials);
      if (res.data && Array.isArray(res.data)) {
        setTestimonials(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormExam('');
    setFormText('');
    setFormYear('2025');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingItem(t);
    setFormName(t.studentName);
    setFormExam(t.exam);
    setFormText(t.testimonial);
    setFormYear(t.year);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formName) return;
    let updated: Testimonial[];
    if (editingItem) {
      updated = testimonials.map((t) =>
        t.id === editingItem.id ? { ...t, studentName: formName, exam: formExam, testimonial: formText, year: formYear } : t
      );
    } else {
      updated = [
        ...testimonials,
        { id: 't_' + Date.now(), studentName: formName, exam: formExam, testimonial: formText, year: formYear, rating: 5, published: true },
      ];
    }
    setTestimonials(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('testimonials', testimonials);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Student Testimonials CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage student reviews, testimonials, and star ratings on the website.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add Testimonial
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
              <TableHead>Exam Prepared</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-bold text-white text-xs">{t.studentName}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{t.exam}</TableCell>
                <TableCell className="text-xs text-slate-300 max-w-sm leading-relaxed">{t.testimonial}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400" />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(t)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4">
          <Input label="Student Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Exam / Batch (e.g. OSSC CGL, SSC CHSL, Railway NTPC)" value={formExam} onChange={(e) => setFormExam(e.target.value)} />
          <Input label="Year (e.g. 2024)" value={formYear} onChange={(e) => setFormYear(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Student Review Text</label>
            <textarea
              rows={3}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveModal}>Save Testimonial</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
