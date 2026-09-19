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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
}

const defaultFaqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What competitive exams does OCI prepare students for?',
    answer: 'OCI prepares students for SSC (CGL, CHSL, MTS, GD), Odisha State Government Exams (OSSC, OSSSC, Police Constable/SI), Railways (RRB NTPC, Group D), Banking (IBPS, SBI), Defence, and Teaching entrance exams.',
    category: 'General',
    published: true,
  },
  {
    id: 'faq-2',
    question: 'Where is OCI located in Bhadrak?',
    answer: 'OCI is located at Nayabazar, near Old Rajghat Bridge, Bhadrak, Odisha — 756100.',
    category: 'Location',
    published: true,
  },
  {
    id: 'faq-3',
    question: 'What are the institute office hours and admission timings?',
    answer: 'Our admissions and office hours are 8:00 AM – 8:00 PM (Monday to Sunday). You can also call us at 7205021878 or WhatsApp 7655004403.',
    category: 'Admission',
    published: true,
  },
];

export default function FaqsCmsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFaqs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formQ, setFormQ] = useState('');
  const [formA, setFormA] = useState('');
  const [formCat, setFormCat] = useState('General');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('faqs', defaultFaqs);
      if (res.data && Array.isArray(res.data)) {
        setFaqs(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormQ('');
    setFormA('');
    setFormCat('General');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FAQ) => {
    setEditingFaq(f);
    setFormQ(f.question);
    setFormA(f.answer);
    setFormCat(f.category);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formQ) return;
    let updated: FAQ[];
    if (editingFaq) {
      updated = faqs.map((f) =>
        f.id === editingFaq.id ? { ...f, question: formQ, answer: formA, category: formCat } : f
      );
    } else {
      updated = [
        ...faqs,
        { id: 'faq_' + Date.now(), question: formQ, answer: formA, category: formCat, published: true },
      ];
    }
    setFaqs(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('faqs', faqs);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Frequently Asked Questions (FAQs) CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage public questions, categorized answers, and admission help.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add FAQ
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
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-bold text-white text-xs max-w-xs">{f.question}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{f.category}</TableCell>
                <TableCell className="text-xs text-slate-300 max-w-md leading-relaxed">{f.answer}</TableCell>
                <TableCell>
                  <Badge variant="success">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(f)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}>
        <div className="space-y-4">
          <Input label="Question" value={formQ} onChange={(e) => setFormQ(e.target.value)} />
          <Input label="Category (e.g. General, Admission, Location, Academics)" value={formCat} onChange={(e) => setFormCat(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Answer</label>
            <textarea
              rows={4}
              value={formA}
              onChange={(e) => setFormA(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveModal}>Save FAQ</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
