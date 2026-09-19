'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { Video, Plus, ExternalLink, Radio, Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function FacultyClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Logical Reasoning');
  const [scheduledStart, setScheduledStart] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('live_classes').select('*').order('scheduled_start', { ascending: false });
      if (data) setClasses(data);
    }
    load();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const roomId = `OCI_FACULTY_${Date.now()}`;
    const newCls = {
      title,
      subject,
      scheduled_start: scheduledStart || new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 5400000).toISOString(),
      jitsi_room_name: roomId,
      status: 'scheduled',
    };

    try {
      await supabase.from('live_classes').insert(newCls);
      const { data } = await supabase.from('live_classes').select('*').order('scheduled_start', { ascending: false });
      if (data) setClasses(data);
    } catch (_) {
      setClasses([newCls, ...classes]);
    }
    setIsModalOpen(false);
    setTitle('');
  };

  const handleStartHost = (roomName: string) => {
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Classroom Scheduling & Host Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Launch your high-definition Jitsi video classroom, interact with aspirants, and share lecture slides.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Schedule New Lecture
        </Button>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Interactive Live Lecture">
          <div className="space-y-4">
            <Input
              label="Lecture Title"
              placeholder="e.g. Syllogisms & Seating Arrangement Drills"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Subject"
              placeholder="e.g. Logical Reasoning"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
            />
            <Button className="w-full" onClick={handleCreate}>
              Publish Lecture to Students
            </Button>
          </div>
        </Modal>
      )}

      <div className="space-y-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={cls.status === 'live' ? 'destructive' : 'primary'}>
                  {cls.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
                </Badge>
                <span className="text-xs font-bold text-emerald-400">{cls.subject}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{cls.title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5" /> {formatDateTime(cls.scheduled_start)} • Room: {cls.jitsi_room_name}
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStartHost(cls.jitsi_room_name)}
              leftIcon={<Radio className="h-3.5 w-3.5 animate-pulse" />}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
            >
              Start Host Room
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
