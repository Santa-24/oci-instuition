'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { Video, Calendar, Clock, ExternalLink, Radio, CheckCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    async function loadClasses() {
      const { data } = await supabase.from('live_classes').select('*').order('scheduled_start', { ascending: false });
      if (data) setClasses(data);
    }
    loadClasses();
  }, []);

  const handleJoinSession = (roomName: string) => {
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    window.open(jitsiUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Live Interactive Classrooms</h1>
          <p className="text-xs text-slate-400 mt-1">
            Attend live synchronous video lectures with faculty, raise hands for doubt clearing, and participate in classroom polls.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={cls.status === 'live' ? 'destructive' : 'primary'}>
                  {cls.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
                </Badge>
                <span className="text-xs font-bold text-indigo-400">{cls.subject}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{cls.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTime(cls.scheduled_start)}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                  Room: {cls.jitsi_room_name}
                </span>
              </div>
            </div>

            <Button
              variant={cls.status === 'live' ? 'destructive' : 'secondary'}
              size="sm"
              onClick={() => handleJoinSession(cls.jitsi_room_name)}
              leftIcon={cls.status === 'live' ? <Radio className="h-3.5 w-3.5 animate-pulse" /> : <Video className="h-3.5 w-3.5" />}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
            >
              {cls.status === 'live' ? 'Join Live Lecture' : 'Enter Classroom'}
            </Button>
          </Card>
        ))}

        {classes.length === 0 && (
          <Card className="p-12 text-center text-xs text-slate-500">
            No live classes scheduled for today. Check back shortly.
          </Card>
        )}
      </div>
    </div>
  );
}
