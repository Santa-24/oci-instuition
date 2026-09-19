'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/lib/supabase/client';
import { Award, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadResults() {
      const { data } = await supabase
        .from('exam_results')
        .select('*, exam:exams(title, total_marks)')
        .order('submitted_at', { ascending: false });

      if (data && data.length > 0) {
        setResults(data);
      } else {
        // Fallback sample record for student view
        setResults([
          {
            id: 'res_01',
            exam: { title: 'All India SSC CGL Tier-1 Full Mock Test #01', total_marks: 200 },
            score: 168,
            percentage: 84.0,
            accuracy_percentage: 89.4,
            air_rank: 14,
            submitted_at: new Date().toISOString(),
          },
        ]);
      }
    }
    loadResults();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Performance Scorecards & AIR Rankings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review historical mock examination scores, accuracy metrics, and percentile progressions.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Examination Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>All India Rank</TableHead>
              <TableHead className="text-right">Submission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-bold text-white text-xs">
                  {r.exam?.title || 'Mock Examination'}
                </TableCell>
                <TableCell className="text-xs font-black text-white">
                  {r.score} / {r.exam?.total_marks || r.total_marks || 200}
                </TableCell>
                <TableCell className="text-xs text-indigo-400 font-bold">
                  {r.percentage}%
                </TableCell>
                <TableCell className="text-xs text-emerald-400 font-bold">
                  {r.accuracy_percentage}%
                </TableCell>
                <TableCell>
                  <Badge variant="success">AIR {r.air_rank || 1}</Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-slate-400">
                  {formatDateTime(r.submitted_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
