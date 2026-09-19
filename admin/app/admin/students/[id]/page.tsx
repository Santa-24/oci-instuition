'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { AcademicService } from '@/lib/services/academic-service';
import { Student } from '@/lib/types/admin';
import { ArrowLeft, User, Phone, Mail, GraduationCap, CheckCircle2, Shield, Award, BookOpen } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notFound, setNotFound] = useState(false);

  React.useEffect(() => {
    async function loadStudent() {
      const students = await AcademicService.getStudents();
      const found = students.find((s) => s.id === studentId);
      if (found) {
        setStudent(found);
      } else {
        setNotFound(true);
      }
    }
    loadStudent();
  }, [studentId]);

  if (notFound) {
    return (
      <div className="p-12 text-center space-y-4">
        <User className="h-10 w-10 text-slate-600 mx-auto" />
        <h2 className="text-base font-bold text-white">Student Record Not Found</h2>
        <p className="text-xs text-slate-400">
          No student with ID &quot;{studentId}&quot; exists in the Supabase database.
        </p>
        <Button size="sm" variant="outline" onClick={() => router.push('/admin/students')}>
          Return to Student Directory
        </Button>
      </div>
    );
  }

  if (!student) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading student dossier from Supabase...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic & Batches' },
    { id: 'exams', label: 'Exams & Scorecards' },
    { id: 'activity', label: 'Activity Logs' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Students</span>
        </button>
        <Badge variant={student.status === 'active' ? 'success' : 'destructive'}>
          {student.status.toUpperCase()}
        </Badge>
      </div>

      {/* Student Profile Hero Card */}
      <Card glow className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
              {student.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{student.name}</h2>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                Roll No: {student.rollNo} • {student.batchName}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  {student.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  {student.email}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Enrollment Status</p>
            <p className="text-xl font-black text-emerald-400">Active</p>
            <p className="text-xs text-indigo-400 font-bold mt-0.5">Avg Mock Score: {student.avgMockScore} pts</p>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Summary</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Enrolled Program</span>
                <span className="font-bold text-white">{student.courseName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Batch Code</span>
                <span className="font-bold text-white">{student.batchName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Admission Date</span>
                <span className="font-bold text-white">{student.admissionDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-400">Verified & Enrolled</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Standing</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Curriculum Standing</p>
                    <p className="text-[11px] text-slate-400">Consistent learner</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">Good Standing</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-xs text-slate-400">Latest JEE Mock Score</p>
                <p className="text-lg font-black text-white mt-0.5">{student.avgMockScore} / 300 (AIR 14)</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'academic' && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Subjects & Faculty Curriculum</CardTitle>
            <CardDescription>Academic courses assigned to {student.name}</CardDescription>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Quantitative Aptitude (MATH-01)</p>
                <p className="text-slate-400 mt-0.5">Faculty Lead: Er. R. K. Mohapatra • Active Syllabus</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Logical & Analytical Reasoning (REAS-01)</p>
                <p className="text-slate-400 mt-0.5">Faculty Lead: Prof. Arvind Verma • Active Syllabus</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">General Awareness & Odisha GK (GK-01)</p>
                <p className="text-slate-400 mt-0.5">Faculty Lead: Dr. S. K. Nayak • Active Syllabus</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">English Language & Comprehension (ENG-01)</p>
                <p className="text-slate-400 mt-0.5">Grammar, Vocabulary & Comprehension • Active Syllabus</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'exams' && (
        <Card>
          <CardHeader>
            <CardTitle>Mock Test Performance History</CardTitle>
            <CardDescription>CBT mock tests and simulated assessments attempted</CardDescription>
          </CardHeader>
          <div className="py-8 text-center space-y-2">
            <Award className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No test evaluations submitted yet.</p>
            <p className="text-[11px] text-slate-500">CBT scores and percentiles will populate automatically when completed.</p>
          </div>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Stream</CardTitle>
            <CardDescription>Student live class attendance and download logs</CardDescription>
          </CardHeader>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Student account verified and enrolled in {student.batchName}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Active Enrollment</span>
          </div>
        </Card>
      )}
    </div>
  );
}
