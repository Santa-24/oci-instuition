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

interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  biography: string;
  published: boolean;
}

const defaultFaculty: FacultyMember[] = [
  { id: 'f1', name: 'Dr. P. K. Mishra', subject: 'Quantitative Aptitude & Advanced Math', qualification: 'M.Sc. Mathematics, Ph.D.', experience: '14+ Years', biography: 'Specialist in high-speed arithmetic shortcuts and algebra concepts.', published: true },
  { id: 'f2', name: 'S. N. Mohapatra', subject: 'Reasoning & Mental Ability', qualification: 'M.Tech, Ex-Senior Faculty', experience: '11+ Years', biography: 'Master mentor for logical deduction, puzzles, and analytical reasoning.', published: true },
  { id: 'f3', name: 'A. K. Dash', subject: 'General Studies & Odisha GK', qualification: 'M.A. History, UGC-NET', experience: '12+ Years', biography: 'Expert in Indian Polity, Odisha Geography, History, and Current Affairs.', published: true },
  { id: 'f4', name: 'R. K. Samal', subject: 'English Language & Comprehension', qualification: 'M.A. English, B.Ed.', experience: '10+ Years', biography: 'Focus on vocabulary building, grammatical precision, and reading comprehension.', published: true },
];

export default function WebsiteFacultyCmsPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(defaultFaculty);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formQual, setFormQual] = useState('');
  const [formExp, setFormExp] = useState('');
  const [formBio, setFormBio] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCmsSection('faculty', defaultFaculty);
      if (res.data && Array.isArray(res.data)) {
        setFaculty(res.data);
      }
    }
    load();
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormName('');
    setFormSubject('');
    setFormQual('');
    setFormExp('');
    setFormBio('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FacultyMember) => {
    setEditingMember(f);
    setFormName(f.name);
    setFormSubject(f.subject);
    setFormQual(f.qualification);
    setFormExp(f.experience);
    setFormBio(f.biography || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!formName) return;
    let updated: FacultyMember[];
    if (editingMember) {
      updated = faculty.map((f) =>
        f.id === editingMember.id
          ? { ...f, name: formName, subject: formSubject, qualification: formQual, experience: formExp, biography: formBio }
          : f
      );
    } else {
      updated = [
        ...faculty,
        { id: 'f_' + Date.now(), name: formName, subject: formSubject, qualification: formQual, experience: formExp, biography: formBio, published: true },
      ];
    }
    setFaculty(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFaculty(faculty.filter((f) => f.id !== id));
  };

  const handlePublishAll = async () => {
    setIsLoading(true);
    await saveCmsSection('faculty', faculty);
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Public Faculty Profiles CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Manage public faculty credentials, subjects, experience, and bios.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add Faculty Profile
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
              <TableHead>Faculty Name</TableHead>
              <TableHead>Subject Area</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.map((tch) => (
              <TableRow key={tch.id}>
                <TableCell className="font-bold text-white text-xs">{tch.name}</TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{tch.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{tch.qualification}</TableCell>
                <TableCell className="text-xs text-slate-400">{tch.experience}</TableCell>
                <TableCell>
                  <Badge variant="success">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(tch)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(tch.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? 'Edit Faculty Profile' : 'Add Faculty Profile'}>
        <div className="space-y-4">
          <Input label="Teacher / Faculty Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Subject Area" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
          <Input label="Educational Qualification" value={formQual} onChange={(e) => setFormQual(e.target.value)} />
          <Input label="Experience (e.g. 10+ Years)" value={formExp} onChange={(e) => setFormExp(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Short Biography / Highlights</label>
            <textarea
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveModal}>Save Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
