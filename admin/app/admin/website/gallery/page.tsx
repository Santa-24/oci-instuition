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

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  published: boolean;
}

const defaultGallery: GalleryItem[] = [
  { id: 'g1', title: 'Smart Digital Classroom Session', category: 'Classroom', imageUrl: '/classroom.jpg', description: 'Interactive smart whiteboard instruction with senior mathematics faculty.', published: true },
  { id: 'g2', title: 'All-Odisha Mock Exam Hall', category: 'Examinations', imageUrl: '/exam-hall.jpg', description: 'Students attempting timed CBT simulation tests under strict exam conditions.', published: true },
  { id: 'g3', title: 'Annual Rankers Felicitation Ceremony', category: 'Events', imageUrl: '/event.jpg', description: 'Celebrating our selected students in OSSC, SSC, and Banking exams.', published: true },
];

export default function GalleryCmsPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(defaultGallery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Campus Life');
  const [formUrl, setFormUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('gallery', defaultGallery);
      if (res.data && Array.isArray(res.data)) {
        setGallery(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Campus Life');
    setFormUrl('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: GalleryItem) => {
    setEditingItem(g);
    setFormTitle(g.title);
    setFormCategory(g.category);
    setFormUrl(g.imageUrl);
    setFormDesc(g.description);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formTitle) return;
    let updated: GalleryItem[];
    if (editingItem) {
      updated = gallery.map((g) =>
        g.id === editingItem.id ? { ...g, title: formTitle, category: formCategory, imageUrl: formUrl, description: formDesc } : g
      );
    } else {
      updated = [
        ...gallery,
        { id: 'g_' + Date.now(), title: formTitle, category: formCategory, imageUrl: formUrl || '/classroom.jpg', description: formDesc, published: true },
      ];
    }
    setGallery(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setGallery(gallery.filter((g) => g.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('gallery', gallery);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Campus & Events Gallery CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage photo albums, classroom moments, and student events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add Photo Item
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
              <TableHead>Photo Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gallery.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-bold text-white text-xs">{g.title}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{g.category}</TableCell>
                <TableCell className="text-xs text-slate-300 max-w-xs">{g.description}</TableCell>
                <TableCell>
                  <Badge variant="success">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(g)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Gallery Photo' : 'Add Gallery Photo'}>
        <div className="space-y-4">
          <Input label="Photo Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <Input label="Category (e.g. Campus Life, Classroom, Events, Felicitation)" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
          <Input label="Image URL / Asset Path" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Caption / Description</label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveModal}>Save Photo Item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
