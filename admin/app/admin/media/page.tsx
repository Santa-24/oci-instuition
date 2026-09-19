'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, FileText, Video } from 'lucide-react';

export default function MediaLibraryAdminPage() {
  const assets = [
    { name: 'oci-primary-logo.svg', type: 'Logo Asset', size: '24 KB', usedIn: 'Global Header, Mobile App' },
    { name: 'director-portrait-prof-agrawal.png', type: 'Image', size: '1.8 MB', usedIn: 'Director Message CMS' },
    { name: 'app-preview-mockup-android.png', type: 'Image', size: '2.4 MB', usedIn: 'App Showcase CMS' },
    { name: 'campus-bhubaneswar-facade.jpg', type: 'Image', size: '3.6 MB', usedIn: 'Homepage Hero & About' },
    { name: 'jee-advanced-curriculum-brochure.pdf', type: 'PDF Document', size: '4.2 MB', usedIn: 'Website Download' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Central Media Library</h1>
          <p className="text-xs text-slate-400 mt-1">Manage cloud storage assets, logos, faculty portraits, and brochure downloads.</p>
        </div>
        <Button size="sm" leftIcon={<Upload className="h-4 w-4" />}>
          Upload New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card key={asset.name} className="p-4 space-y-3">
            <div className="h-28 bg-slate-950/80 rounded-lg flex items-center justify-center border border-slate-800">
              <ImageIcon className="h-8 w-8 text-indigo-400 opacity-60" />
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate">{asset.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{asset.usedIn}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                <Badge variant="outline" className="text-[10px] py-0">{asset.type}</Badge>
                <span className="text-[10px] text-slate-400 font-mono">{asset.size}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
