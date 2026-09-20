'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { AcademicService } from '@/lib/services/academic-service';
import { Student, Batch, LiveClass } from '@/lib/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';
import {
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

export default function AttendanceAdminPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [batchList, classList, studentList, attendanceList] = await Promise.all([
        AcademicService.getBatches(),
        AcademicService.getLiveClasses(),
        AcademicService.getStudents(),
        AcademicService.getAttendance({ liveClassId: selectedClass || undefined, batchId: selectedBatch !== 'ALL' ? selectedBatch : undefined }),
      ]);
      setBatches(batchList);
      setLiveClasses(classList);
      setStudents(studentList);
      setAttendanceRecords(attendanceList);
    } catch (err: any) {
      console.error('Failed to load attendance register:', err);
      setFeedback({ type: 'error', message: 'Failed to load attendance records' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatch, selectedClass]);

  const handleMark = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    setUpdatingStudentId(studentId);
    setFeedback(null);
    try {
      await AcademicService.markAttendance({
        studentId,
        liveClassId: selectedClass || undefined,
        status,
      });

      // Update local state optimistic/re-fetch
      setAttendanceRecords((prev) => {
        const existingIdx = prev.findIndex((a) => a.student_id === studentId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], status, recorded_at: new Date().toISOString() };
          return updated;
        }
        return [
          {
            id: `temp-${Date.now()}`,
            student_id: studentId,
            status,
            recorded_at: new Date().toISOString(),
          },
          ...prev,
        ];
      });

      setFeedback({ type: 'success', message: 'Attendance updated successfully' });
    } catch (err: any) {
      console.error('Failed to record attendance:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to record attendance' });
    } finally {
      setUpdatingStudentId(null);
    }
  };

  // Map student attendance status
  const attendanceMap = new Map(attendanceRecords.map((a) => [a.student_id, a.status]));

  const filteredStudents = students.filter((s) => {
    const matchesBatch = selectedBatch === 'ALL' || s.batchId === selectedBatch || s.batchName === selectedBatch;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'late').length;
  const totalRecorded = presentCount + absentCount + lateCount;
  const presentRate = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classroom Attendance Register"
        description="Daily lecture attendance tracking, batch rosters, and student regularity compliance."
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Real-Time Audit
          </span>
        }
      >
        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh Register
        </Button>
      </PageHeader>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
          <p className="text-2xl font-black text-foreground tabular-nums">{presentRate}%</p>
          <p className="text-[11px] text-muted-foreground">{presentCount} of {totalRecorded} recorded</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Present</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{presentCount}</p>
          <p className="text-[11px] text-muted-foreground">In attendance</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">{absentCount}</p>
          <p className="text-[11px] text-muted-foreground">Unexcused / absent</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Late Arrivals</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{lateCount}</p>
          <p className="text-[11px] text-muted-foreground">Delayed entry</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidate name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-subtle"
            />
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Layers className="h-4 w-4 text-muted-foreground hidden sm:inline" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="ALL">All Cohort Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.enrolledCount || 0} seats)
                </option>
              ))}
            </select>
          </div>

          {/* Live Class Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground hidden sm:inline" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle"
            >
              <option value="">General Daily Roster</option>
              {liveClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-subtle shrink-0"
          />
        </div>
      </Card>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Student Attendance Roster Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll Number</TableHead>
              <TableHead>Student Name & Email</TableHead>
              <TableHead>Enrolled Batch</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Mark Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const currentStatus = attendanceMap.get(student.id) || 'absent';
              const isUpdating = updatingStudentId === student.id;

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-mono font-bold text-xs text-foreground">
                    {student.rollNo}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-xs">{student.name}</p>
                      <p className="text-[11px] text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {student.batchName || 'General Roster'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={currentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={currentStatus === 'present' ? 'primary' : 'outline'}
                        onClick={() => handleMark(student.id, 'present')}
                        disabled={isUpdating}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={currentStatus === 'late' ? 'accent' : 'outline'}
                        onClick={() => handleMark(student.id, 'late')}
                        disabled={isUpdating}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
                        onClick={() => handleMark(student.id, 'absent')}
                        disabled={isUpdating}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        Absent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <EmptyState
                    icon={<Users className="h-6 w-6 text-muted-foreground" />}
                    title="No Students Match Filter"
                    description="No candidates found matching the selected cohort batch or search criteria."
                    compact
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
