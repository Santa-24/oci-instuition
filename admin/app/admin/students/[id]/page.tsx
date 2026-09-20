'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { AcademicService } from '@/lib/services/academic-service';
import { Student } from '@/lib/types/admin';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
} from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      setIsLoading(true);
      try {
        const students = await AcademicService.getStudents();
        const found = students.find((s) => s.id === studentId);
        if (found) {
          setStudent(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load student dossier:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  if (notFound) {
    return (
      <div className="py-16 text-center space-y-4">
        <EmptyState
          icon={<User className="h-8 w-8 text-muted-foreground" />}
          title="Student Record Not Found"
          description={`No candidate with identifier "${studentId}" exists in the institution database.`}
          actionLabel="Return to Student Directory"
          onAction={() => router.push('/admin/students')}
        />
      </div>
    );
  }

  if (isLoading || !student) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full mx-auto" />
        <p className="text-xs font-semibold text-muted-foreground">Loading student academic dossier...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Profile' },
    { id: 'academic', label: 'Cohort & Curriculum' },
    { id: 'exams', label: 'CBT Exam Results' },
    { id: 'attendance', label: 'Attendance Record' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Students Directory</span>
        </Link>
        <StatusBadge status={student.status || 'active'} />
      </div>

      {/* Student Dossier Hero Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-subtle shrink-0">
              {student.name[0]}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground tracking-tight">{student.name}</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="font-mono bg-canvas-subtle px-2 py-0.5 rounded border border-border">
                  {student.rollNo}
                </span>
                <span>•</span>
                <span className="text-foreground">{student.batchName || 'General Roster'}</span>
              </div>
              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {student.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {student.email}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:border-l border-border sm:pl-6">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Institutional Status
            </p>
            <p className="text-sm font-bold text-foreground">Verified Enrolled Aspirant</p>
            <p className="text-[11px] text-muted-foreground">Nayabazar, Bhadrak Campus</p>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled Cohort
            </h4>
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">{student.batchName || 'General Cohort'}</p>
              <p className="text-xs text-muted-foreground">Classroom Schedule: Mon - Fri 08:00 AM - 01:30 PM</p>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Target Examination Stream
            </h4>
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">Central & State Combined</p>
              <p className="text-xs text-muted-foreground">SSC CGL, OSSC CGL, Railway NTPC</p>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              System Verification
            </h4>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>RBAC Role: Student Account</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Synced to Supabase public.students & user_roles.</p>
          </Card>
        </div>
      )}

      {activeTab === 'academic' && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-none mb-0">
            <CardTitle>Academic Curriculum Tracking</CardTitle>
            <CardDescription>Enrolled courses, active batch timetable, and classroom allocation</CardDescription>
          </CardHeader>
          <div className="p-4 rounded-xl border border-border bg-canvas-subtle/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Cohort Batch: {student.batchName || 'Assigned Roster'}</span>
              <StatusBadge status="active" />
            </div>
            <p className="text-xs text-muted-foreground">
              Classroom Hall A (Smart Classroom) • Daily 08:00 AM - 01:30 PM
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'exams' && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-none mb-0">
            <CardTitle>CBT Mock Examination History</CardTitle>
            <CardDescription>Simulated computer-based examinations, scores, accuracy, and AIR ranks</CardDescription>
          </CardHeader>
          <EmptyState
            icon={<HelpCircle className="h-6 w-6 text-muted-foreground" />}
            title="No CBT Exam Attempts Logged"
            description="Scorecards and All India Ranks will chart dynamically here as the candidate completes scheduled mock tests in the student portal."
            actionLabel="View CBT Exams Series"
            onAction={() => router.push('/admin/mock-exams')}
            compact
          />
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-none mb-0">
            <CardTitle>Classroom Attendance Logs</CardTitle>
            <CardDescription>Daily physical classroom and live lecture presence records</CardDescription>
          </CardHeader>
          <EmptyState
            icon={<Calendar className="h-6 w-6 text-muted-foreground" />}
            title="Attendance Records In Synced Register"
            description="Regularity percentages and daily timestamps can be audited and marked from the central Attendance Register."
            actionLabel="Open Attendance Register"
            onAction={() => router.push('/admin/attendance')}
            compact
          />
        </Card>
      )}
    </div>
  );
}
