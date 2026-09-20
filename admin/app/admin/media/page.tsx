'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon, FileText, Video, Copy, Check, Trash2, Search, Filter } from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  category: 'Branding' | 'Academic Document' | 'Campus Imagery' | 'Mobile App';
  size: string;
  type: string;
  usedIn: string;
  url: string;
}

const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: '1',
    name: 'oci-primary-crest.svg',
    category: 'Branding',
    size: '28 KB',
    type: 'SVG Vector',
    usedIn: 'Admin Shell, Web Portal Header, Marksheets',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/branding/oci-logo.svg',
  },
  {
    id: '2',
    name: 'director-portrait-official.jpg',
    category: 'Branding',
    size: '1.4 MB',
    type: 'JPG Image',
    usedIn: 'Director Message CMS, About OCI Page',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/faculty/director.jpg',
  },
  {
    id: '3',
    name: 'bhadrak-nayabazar-campus.jpg',
    category: 'Campus Imagery',
    size: '3.2 MB',
    type: 'JPG Image',
    usedIn: 'Campus Infrastructure, Homepage Hero',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/campus/nayabazar-campus.jpg',
  },
  {
    id: '4',
    name: 'ossc-cgl-prelims-curriculum.pdf',
    category: 'Academic Document',
    size: '4.8 MB',
    type: 'PDF Document',
    usedIn: 'Student Resource Downloads, Course Dossier',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/curriculum/ossc-cgl.pdf',
  },
  {
    id: '5',
    name: 'ssc-cgl-mathematics-handbook.pdf',
    category: 'Academic Document',
    size: '6.5 MB',
    type: 'PDF Document',
    usedIn: 'Central Govt SSC Stream Syllabus Module',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/curriculum/ssc-math.pdf',
  },
  {
    id: '6',
    name: 'oci-student-app-banner.png',
    category: 'Mobile App',
    size: '1.9 MB',
    type: 'PNG Image',
    usedIn: 'App Showcase CMS, Google Play Assets',
    url: 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/app/showcase.png',
  },
];

export default function MediaLibraryAdminPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Modal States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MediaAsset['category']>('Branding');
  const [formUsedIn, setFormUsedIn] = useState('');
  const [formUrl, setFormUrl] = useState('');

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this asset from the library index?')) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newAsset: MediaAsset = {
      id: Date.now().toString(),
      name: formName.trim(),
      category: formCategory,
      size: '1.2 MB',
      type: formName.endsWith('.pdf') ? 'PDF Document' : 'Image',
      usedIn: formUsedIn.trim() || 'General Resource',
      url: formUrl.trim() || 'https://utrusmludikyvxbmpicg.supabase.co/storage/v1/object/public/materials/assets/' + formName.trim(),
    };

    setAssets([newAsset, ...assets]);
    setIsModalOpen(false);
    setFormName('');
    setFormUsedIn('');
    setFormUrl('');
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.usedIn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Media & Asset Library"
        description="Institutional media assets, official crests, syllabus prospectuses, and campus imagery hosted on CDN."
        statusPill={<StatusBadge status="live" label="CLOUD CDN ACTIVE" size="sm" />}
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Upload className="h-4 w-4" />}>
            Upload New Asset
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by file name or usage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Branding', 'Academic Document', 'Campus Imagery', 'Mobile App'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="p-4 space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="h-28 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800">
                {asset.type.includes('PDF') ? (
                  <FileText className="h-8 w-8 text-rose-500 opacity-80" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-primary-500 opacity-80" />
                )}
              </div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{asset.size}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {asset.usedIn}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <StatusBadge status="neutral" label={asset.category} size="sm" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(asset.id, asset.url)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Public URL"
                  >
                    {copiedId === asset.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <EmptyState
            icon={ImageIcon}
            title={searchQuery || selectedCategory !== 'ALL' ? 'No Matching Media Assets' : 'Media Library is Empty'}
            description={
              searchQuery || selectedCategory !== 'ALL'
                ? 'Try clearing your search query or selecting a different category filter.'
                : 'Upload institution branding, prospectus PDFs, and campus photos to make them available across all pages.'
            }
            actionLabel={searchQuery || selectedCategory !== 'ALL' ? 'Clear Filters' : 'Upload First Asset'}
            onAction={
              searchQuery || selectedCategory !== 'ALL'
                ? () => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }
                : () => setIsModalOpen(true)
            }
          />
        </Card>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Media Asset">
        <form onSubmit={handleAddAsset} className="space-y-4">
          <Input
            label="File Name"
            placeholder="e.g. oci-brochure-2026.pdf"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as MediaAsset['category'])}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="Branding">Branding (Logos, Seals, Icons)</option>
              <option value="Academic Document">Academic Document (Syllabus, DPP, Prospectus)</option>
              <option value="Campus Imagery">Campus Imagery (Nayabazar Classrooms, Labs)</option>
              <option value="Mobile App">Mobile App (Screenshots, App Icons)</option>
            </select>
          </div>

          <Input
            label="Usage Context"
            placeholder="e.g. OCI Admissions Portal, Hero Banner"
            value={formUsedIn}
            onChange={(e) => setFormUsedIn(e.target.value)}
          />

          <Input
            label="Storage URL (Optional CDN link)"
            placeholder="https://utrusmludikyvxbmpicg.supabase.co/storage/..."
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
