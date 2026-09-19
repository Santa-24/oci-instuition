'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function FacultyMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
      if (data) setMaterials(data);
    }
    load();
  }, []);

  const handleUpload = async () => {
    if (!title.trim()) return;
    const newMat = {
      title,
      subject,
      type: 'PDF',
      file_url: fileUrl || 'https://oci.edu.in/materials/sample_handout.pdf',
      file_size: fileSize,
    };

    try {
      await supabase.from('study_materials').insert(newMat);
      const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
      if (data) setMaterials(data);
    } catch (_) {
      setMaterials([newMat, ...materials]);
    }
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Study Material Distribution</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload chapter notes, formula sheets, and DPP sets for batch students.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Upload New Material
        </Button>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Student Study Material">
          <div className="space-y-4">
            <Input
              label="Document Title"
              placeholder="e.g. Percentage & Profit Loss Formula Sheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Input
              label="Document URL / Cloud Link"
              placeholder="https://... or Supabase Storage link"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <Button className="w-full" onClick={handleUpload}>
              Publish Document
            </Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => (
          <Card key={m.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{m.subject}</Badge>
                <span className="text-[11px] text-slate-400 font-mono">{m.file_size || 'PDF'}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{m.title}</h3>
              <p className="text-[11px] text-slate-400">Added: {formatDateTime(m.created_at)}</p>
            </div>

            <div className="flex items-center gap-2">
              <a href={m.file_url || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="sm" variant="secondary" className="w-full" leftIcon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
