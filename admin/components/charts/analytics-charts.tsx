'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function ExamParticipationChart() {
  const data = [
    { month: 'Apr', count: '450', height: '40%' },
    { month: 'May', count: '620', height: '55%' },
    { month: 'Jun', count: '810', height: '70%' },
    { month: 'Jul', count: '950', height: '82%' },
    { month: 'Aug', count: '1.2k', height: '95%' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Mock Exam Attempts & Participation (2026)</CardTitle>
          <CardDescription>Monthly completed student tests across all batches</CardDescription>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          +24.8% Growth
        </span>
      </CardHeader>
      <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2">
        {data.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="text-[11px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.count} tests
            </div>
            <div className="w-full bg-slate-800/80 rounded-t-lg relative overflow-hidden flex items-end h-32">
              <div
                style={{ height: item.height }}
                className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg group-hover:from-indigo-600 group-hover:to-indigo-400 transition-all duration-500"
              />
            </div>
            <span className="text-xs font-semibold text-slate-400">{item.month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BatchProgressChart() {
  const batches = [
    { name: 'JEE Alpha Super 30', rate: 94.2, color: 'bg-emerald-500' },
    { name: 'JEE Beta Foundation', rate: 88.0, color: 'bg-indigo-500' },
    { name: 'NEET Achievers 2027', rate: 96.5, color: 'bg-rose-500' },
    { name: 'OPSC Civil Services', rate: 91.4, color: 'bg-amber-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Syllabus Progress</CardTitle>
        <CardDescription>Curriculum completion across active batches</CardDescription>
      </CardHeader>
      <div className="space-y-4 pt-2">
        {batches.map((b) => (
          <div key={b.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-200">{b.name}</span>
              <span className="text-white font-bold">{b.rate}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${b.rate}%` }}
                className={`h-full ${b.color} rounded-full transition-all duration-700`}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
