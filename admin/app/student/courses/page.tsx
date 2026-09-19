'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { BookOpen, CheckCircle, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [cRes, sRes] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*'),
      ]);
      if (cRes.data) setCourses(cRes.data);
      if (sRes.data) setSubjects(sRes.data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">My Academic Courses & Curriculum</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your enrolled syllabus, subjects, scheduled modules, and preparation milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} glow className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="success">ENROLLED</Badge>
                <span className="text-xs text-slate-400 font-mono">{course.code}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-3">{course.name}</h2>
              <p className="text-xs text-slate-300 mt-1">{course.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  {course.duration_months} Months
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  {course.category}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Curriculum Subjects</h4>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((subj) => (
                  <div key={subj.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-200 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{subj.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {courses.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-slate-500">Loading academic curriculum...</div>
        )}
      </div>
    </div>
  );
}
