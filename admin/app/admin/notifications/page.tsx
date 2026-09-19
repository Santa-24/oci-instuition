'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export default function NotificationsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [history, setHistory] = useState([
    {
      id: 'notif_01',
      title: 'Gauss Law Lecture 4 is Live Now!',
      body: 'Dr. H. C. Verma is hosting Electrostatics Lecture 4 in Room Alpha. Tap to join live.',
      target: 'JEE Alpha Super 30',
      sentAt: '11 Aug 2026, 10:00 AM',
      deliveryCount: '42 Delivered',
    },
    {
      id: 'notif_02',
      title: 'Mock Test #4 Scorecards Published',
      body: 'Results and All India Rank percentiles are now live. Review your weak areas in the test portal.',
      target: 'All Students (420)',
      sentAt: '10 Aug 2026, 06:00 PM',
      deliveryCount: '418 Delivered',
    },
  ]);

  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTarget, setFormTarget] = useState('All Students (420)');

  const handleSend = () => {
    if (!formTitle.trim()) return;
    setHistory([
      {
        id: `notif_${Date.now()}`,
        title: formTitle,
        body: formBody,
        target: formTarget,
        sentAt: 'Just Now',
        deliveryCount: 'Broadcasting...',
      },
      ...history,
    ]);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Push Notifications Broadcaster</h1>
          <p className="text-xs text-slate-400 mt-1">Broadcast high-priority push notifications to student and faculty mobile devices.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Send className="h-4 w-4" />}>
          Compose Push Broadcast
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification Title & Message</TableHead>
              <TableHead>Target Audience</TableHead>
              <TableHead>Delivered Count</TableHead>
              <TableHead>Sent Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="max-w-md">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{h.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{h.body}</div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-indigo-400">{h.target}</TableCell>
                <TableCell className="text-xs font-bold text-emerald-400">{h.deliveryCount}</TableCell>
                <TableCell className="text-xs text-slate-400">{h.sentAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compose FCM Push Notification"
      >
        <div className="space-y-4">
          <Input label="Notification Title" placeholder="e.g. Schedule Update: Physics Class" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Notification Body Message</label>
            <textarea
              rows={3}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Enter message displayed on student mobile lock screens..."
              className="w-full rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Target Audience</label>
            <select
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950/70 px-3 text-xs text-slate-200"
            >
              <option value="All Students (420)">All Enrolled Students (420)</option>
              <option value="JEE Alpha Super 30">JEE Alpha Super 30 (42)</option>
              <option value="NEET Achievers 2027">NEET Achievers 2027 (48)</option>
              <option value="Faculty Only">Faculty Only (18)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSend}>
              {isSent ? 'Sent Successfully!' : 'Broadcast to Devices'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
