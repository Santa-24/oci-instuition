'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download } from 'lucide-react';

export default function StudyMaterialsAdminPage() {
  const materials = [
    { title: 'Electrostatics Solved Theory & Derivations.pdf', subject: 'Physics', batch: 'JEE Alpha', size: '4.8 MB', downloads: 38 },
    { title: 'DPP-01: Coulomb Law Numerical Exercises.pdf', subject: 'Physics', batch: 'JEE Alpha', size: '1.2 MB', downloads: 41 },
    { title: 'Capacitance & Dielectric Energy Notes.pdf', subject: 'Physics', batch: 'JEE Alpha', size: '3.4 MB', downloads: 35 },
    { title: '10-Year Previous Solved JEE Advanced Papers.pdf', subject: 'All Subjects', batch: 'All Batches', size: '12.6 MB', downloads: 120 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Study Materials & Notes (PDF)</h1>
          <p className="text-xs text-slate-400 mt-1">Upload and distribute official PDF theory modules, DPPs, and formula sheets.</p>
        </div>
        <Button size="sm" leftIcon={<Upload className="h-4 w-4" />}>
          Upload PDF Material
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Target Batch</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((mat) => (
              <TableRow key={mat.title}>
                <TableCell className="font-bold text-white max-w-md flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-400" />
                  <span>{mat.title}</span>
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-semibold">{mat.subject}</TableCell>
                <TableCell className="text-xs text-slate-300">{mat.batch}</TableCell>
                <TableCell className="text-xs text-slate-400">{mat.size}</TableCell>
                <TableCell className="text-xs font-bold text-emerald-400">{mat.downloads}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
