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

  React.useEffect(() => {
    async function loadStudent() {
      const students = await AcademicService.getStudents();
      const found = students.find((s) => s.id === studentId) || students[0] || {
        id: studentId,
        name: 'Student',
        rollNo: 'OCI-2026-0042',
        email: 'student@oci.edu.in',
        phone: '+91 70081 34567',
        courseId: 'crs_01',
        courseName: 'JEE Advanced 2 Year Comprehensive',
        batchId: 'batch_alpha',
        batchName: 'JEE Alpha Super 30',
        admissionDate: '2026-04-05',
        status: 'active',
        avgMockScore: 240,
      };
      setStudent(found);
    }
    loadStudent();
  }, [studentId]);

  if (!student) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading student dossier...</div>;
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
            <CardTitle>Enrolled Subjects & Faculty</CardTitle>
            <CardDescription>Academic courses assigned to {student.name}</CardDescription>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Physics (Electrostatics & Modern Physics)</p>
                <p className="text-slate-400 mt-0.5">Faculty: Dr. H. C. Verma • Active Module</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Chemistry (Organic & Physical Chemistry)</p>
                <p className="text-slate-400 mt-0.5">Faculty: Dr. O. P. Tandon • Active Module</p>
              </div>
              <Badge variant="outline">Enrolled</Badge>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Mathematics (Calculus & Vectors)</p>
                <p className="text-slate-400 mt-0.5">Faculty: Prof. Amit M. Agarwal • Active Module</p>
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
            <CardDescription>Simulated CBT examinations attempted</CardDescription>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">All India JEE Advanced Full Mock #4</p>
                <p className="text-slate-400 mt-0.5">11 Aug 2026 • Accuracy: 84.5% • Rank: AIR 14</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-white">248 / 300</p>
                <Badge variant="success" className="mt-0.5">TOP 1%</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">All India JEE Advanced Full Mock #3</p>
                <p className="text-slate-400 mt-0.5">04 Aug 2026 • Accuracy: 81.0% • Rank: AIR 28</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-white">236 / 300</p>
                <Badge variant="success" className="mt-0.5">TOP 2%</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Stream</CardTitle>
            <CardDescription>In-app lectures attended, DPP downloads, and doubt questions</CardDescription>
          </CardHeader>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Downloaded DPP #12: Electrostatics Problems PDF</span>
              <span className="text-slate-500">11 Aug 2026, 12:45 PM</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Completed All India JEE Advanced Full Mock #4</span>
              <span className="text-slate-500">11 Aug 2026, 12:00 PM</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Attended Physics Live Lecture 4 (Gauss Law)</span>
              <span className="text-slate-500">11 Aug 2026, 10:00 AM</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
