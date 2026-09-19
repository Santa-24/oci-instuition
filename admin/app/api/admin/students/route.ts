import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: students, error: sErr } = await supabaseAdmin
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (sErr) throw sErr;

    const [profilesRes, batchesRes, coursesRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, email, phone'),
      supabaseAdmin.from('batches').select('id, name, course_id'),
      supabaseAdmin.from('courses').select('id, name'),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
    const batchMap = new Map((batchesRes.data || []).map((b) => [b.id, b]));
    const courseMap = new Map((coursesRes.data || []).map((c) => [c.id, c.name]));

    const enriched = (students || []).map((s) => {
      const p = profileMap.get(s.id);
      const b = s.batch_id ? batchMap.get(s.batch_id) : undefined;
      const courseName = b?.course_id ? courseMap.get(b.course_id) : 'General Program';

      return {
        id: s.id,
        name: p?.full_name || 'Enrolled Student',
        rollNo: s.roll_no || 'OCI-ST-000',
        email: p?.email || '',
        phone: p?.phone || '',
        courseId: b?.course_id || '',
        courseName: courseName,
        batchId: s.batch_id || '',
        batchName: b?.name || 'Unassigned',
        admissionDate: s.admission_date || new Date().toISOString().split('T')[0],
        status: s.status || 'active',
      };
    });

    return NextResponse.json({ success: true, students: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rollNo, email, phone, batchId, status } = body;

    if (!name || !rollNo) {
      return NextResponse.json({ success: false, error: 'Student name and Roll No are required' }, { status: 400 });
    }

    const studentUuid = crypto.randomUUID();
    const userEmail = email?.trim() || `student_${Date.now()}@oci.org.in`;

    // 1. Create Profile
    const { error: pErr } = await supabaseAdmin.from('profiles').insert({
      id: studentUuid,
      full_name: name.trim(),
      email: userEmail,
      phone: phone?.trim() || null,
    });
    if (pErr) throw pErr;

    // 2. Assign Role
    await supabaseAdmin.from('user_roles').insert({
      id: crypto.randomUUID(),
      user_id: studentUuid,
      role: 'student',
    });

    // 3. Create Student Entry
    const { data: student, error: sErr } = await supabaseAdmin
      .from('students')
      .insert({
        id: studentUuid,
        roll_no: rollNo.trim().toUpperCase(),
        batch_id: batchId || null,
        status: status || 'active',
        admission_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (sErr) throw sErr;

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: name.trim(),
        rollNo: student.roll_no,
        email: userEmail,
        phone: phone || '',
        batchId: student.batch_id,
        status: student.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, batchId, status, name, phone } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    if (status !== undefined || batchId !== undefined) {
      const studentUpdate: Record<string, any> = {};
      if (status !== undefined) studentUpdate.status = status;
      if (batchId !== undefined) studentUpdate.batch_id = batchId || null;
      await supabaseAdmin.from('students').update(studentUpdate).eq('id', id);
    }

    if (name !== undefined || phone !== undefined) {
      const profileUpdate: Record<string, any> = {};
      if (name !== undefined) profileUpdate.full_name = name;
      if (phone !== undefined) profileUpdate.phone = phone;
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', id);
    }

    return NextResponse.json({ success: true, message: 'Student updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    // Cascade deletes student, roles, and profiles
    await supabaseAdmin.from('students').delete().eq('id', id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    return NextResponse.json({ success: true, message: 'Student removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
