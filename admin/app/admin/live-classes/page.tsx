'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { LiveClass, Batch } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import { Plus, Radio, ExternalLink, RefreshCw } from 'lucide-react';

export default function LiveClassesAdminPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Quantitative Aptitude');
  const [formTeacher, setFormTeacher] = useState('OCI Faculty Lead');
  const [formBatch, setFormBatch] = useState('');

  const fetchLiveClasses = async () => {
    setIsLoading(true);
    try {
      const [classList, batchList] = await Promise.all([
        AcademicService.getLiveClasses(),
        AcademicService.getBatches(),
      ]);
      setClasses(classList);
      setBatches(batchList);
      if (batchList.length > 0 && !formBatch) {
        setFormBatch(batchList[0].id);
      }
    } catch (e) {
      console.error('Failed to load live classes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const handleSchedule = async () => {
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 90 * 60000); // 90 mins later
      await AcademicService.createLiveClass({
        title: formTitle.trim(),
        subject: formSubject.trim(),
        batchId: formBatch,
        scheduledStart: now.toISOString(),
        scheduledEnd: end.toISOString(),
      });
      await fetchLiveClasses();
      setFormTitle('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to schedule class:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Live Classrooms & Jitsi Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">Schedule live classes, monitor active streams, and manage Jitsi rooms.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchLiveClasses} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Schedule Live Session
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Title & Subject</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Faculty Host</TableHead>
              <TableHead>Schedule Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Jitsi Room</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading live classrooms from database...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No live classes scheduled.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-2">
                      {cls.status === 'live' && <Radio className="h-4 w-4 text-rose-500 animate-pulse" />}
                      <span>{cls.title}</span>
                    </div>
                    <div className="text-xs text-indigo-400 font-semibold">{cls.subject}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">{cls.batchName}</TableCell>
                  <TableCell className="text-xs text-slate-200">{cls.teacherName}</TableCell>
                  <TableCell className="text-xs text-slate-400">{formatDateTime(cls.scheduledStartTime)}</TableCell>
                  <TableCell>
                    <Badge variant={cls.status === 'live' ? 'live' : 'outline'}>
                      {cls.status === 'live' ? `LIVE (${cls.attendeeCount || 0} in room)` : 'SCHEDULED'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://meet.jit.si/${cls.jitsiRoomName}`, '_blank')}
                      leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      Open Room
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Live Classroom Session"
        description="Creates Jitsi meeting room and notifies enrolled students"
      >
        <div className="space-y-4">
          <Input label="Session Title" placeholder="e.g. Quantitative Aptitude — Shortcut Problem Solving" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <Input label="Subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Batch</label>
            <select
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Faculty Host" value={formTeacher} onChange={(e) => setFormTeacher(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSchedule} disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule & Broadcast'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
