import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liveClassId = searchParams.get('liveClassId');
    const batchId = searchParams.get('batchId');

    let query = supabaseAdmin
      .from('attendance')
      .select('id, student_id, live_class_id, status, recorded_at')
      .order('recorded_at', { ascending: false });

    if (liveClassId) {
      query = query.eq('live_class_id', liveClassId);
    }

    const { data: attendanceList, error } = await query;
    if (error) throw error;

    // Enrich with student details
    const studentIds = Array.from(new Set((attendanceList || []).map((a) => a.student_id).filter(Boolean)));
    
    let studentMap = new Map();
    if (studentIds.length > 0) {
      const { data: students } = await supabaseAdmin
        .from('students')
        .select('id, roll_no, profiles(full_name, email)')
        .in('id', studentIds);

      (students || []).forEach((s: any) => {
        studentMap.set(s.id, {
          rollNo: s.roll_no,
          name: s.profiles?.full_name || 'Student Aspirant',
          email: s.profiles?.email || '',
        });
      });
    }

    const enriched = (attendanceList || []).map((a) => ({
      ...a,
      studentName: studentMap.get(a.student_id)?.name || 'Enrolled Student',
      studentRollNo: studentMap.get(a.student_id)?.rollNo || 'N/A',
      studentEmail: studentMap.get(a.student_id)?.email || '',
    }));

    return NextResponse.json({ success: true, attendance: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, liveClassId, status = 'present' } = body;

    if (!studentId || !status) {
      return NextResponse.json(
        { success: false, error: 'Student ID and status are required' },
        { status: 400 }
      );
    }

    // Check if an existing attendance record exists for this student & live class
    let existingQuery = supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', studentId);

    if (liveClassId) {
      existingQuery = existingQuery.eq('live_class_id', liveClassId);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('attendance')
        .update({ status, recorded_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, attendance: updated });
    }

    const { data: created, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        id: crypto.randomUUID(),
        student_id: studentId,
        live_class_id: liveClassId || null,
        status,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, attendance: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Attendance record ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('attendance').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Attendance record removed' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete attendance' },
      { status: 500 }
    );
  }
}
