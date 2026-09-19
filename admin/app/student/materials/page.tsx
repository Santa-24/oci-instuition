'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { FileText, Download, Search, CheckCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadMaterials() {
      const { data } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
      if (data) setMaterials(data);
    }
    loadMaterials();
  }, []);

  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Study Materials & High-Yield Notes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Download official OCI formula sheets, Daily Practice Papers (DPPs), and chapter lecture notes.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search notes or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mat) => (
          <Card key={mat.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{mat.subject}</Badge>
                <span className="text-[11px] text-slate-400 font-mono">{mat.file_size || 'PDF'}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{mat.title}</h3>
              <p className="text-[11px] text-slate-400">Published: {formatDateTime(mat.created_at)}</p>
            </div>

            <a href={mat.file_url || '#'} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button size="sm" variant="secondary" className="w-full" leftIcon={<Download className="h-3.5 w-3.5" />}>
                Download Document
              </Button>
            </a>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No study materials found matching your search query.
          </div>
        )}
      </div>
    </div>
  );
}
