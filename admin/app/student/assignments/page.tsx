'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { ClipboardList, Upload, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setAssignments(data);
      } else {
        setAssignments([
          { id: 'asg_1', title: 'Quantitative Practice Set 04: Work & Time Problems', subject: 'Math', due_date: new Date(Date.now() + 86400000 * 3).toISOString(), description: 'Solve problems 1 through 25 from the DPP sheet.' },
          { id: 'asg_2', title: 'Logical Reasoning: Linear & Circular Seating Arrangement', subject: 'Reasoning', due_date: new Date(Date.now() + 86400000 * 5).toISOString(), description: 'Draw puzzle diagrams and submit solution PDF.' },
        ]);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!submissionUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('assignment_submissions').upsert({
        assignment_id: activeAssignment?.id,
        student_id: 'usr_std_01',
        submission_url: submissionUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });
      setSubmittedIds(prev => new Set(prev).add(activeAssignment.id));
      setActiveAssignment(null);
      setSubmissionUrl('');
    } catch (_) {
      setSubmittedIds(prev => new Set(prev).add(activeAssignment.id));
      setActiveAssignment(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Homework & Practice Assignments</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete daily practice problem sets, upload your work, and review faculty evaluations.
        </p>
      </div>

      {activeAssignment && (
        <Modal isOpen={Boolean(activeAssignment)} onClose={() => setActiveAssignment(null)} title={`Submit: ${activeAssignment.title}`}>
          <div className="space-y-4">
            <p className="text-xs text-slate-300">{activeAssignment.description}</p>
            <Input
              label="Solution Document / Cloud Storage Link"
              placeholder="https://drive.google.com/... or Supabase Storage link"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              required
            />
            <Button className="w-full" onClick={handleSubmit} isLoading={isSubmitting}>
              Confirm Submission
            </Button>
          </div>
        </Modal>
      )}

      <div className="space-y-4">
        {assignments.map((asg) => {
          const isDone = submittedIds.has(asg.id);
          return (
            <Card key={asg.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{asg.subject}</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Due: {formatDateTime(asg.due_date)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{asg.title}</h3>
                <p className="text-xs text-slate-400">{asg.description}</p>
              </div>

              {isDone ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submitted</span>
                </div>
              ) : (
                <Button size="sm" onClick={() => setActiveAssignment(asg)} leftIcon={<Upload className="h-3.5 w-3.5" />}>
                  Upload Solution
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
