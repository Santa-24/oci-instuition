import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: batches, error } = await supabaseAdmin
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: courses } = await supabaseAdmin.from('courses').select('id, name');
    const courseMap = new Map((courses || []).map((c) => [c.id, c.name]));

    const { data: students } = await supabaseAdmin.from('students').select('id, batch_id');
    const studentCountMap = new Map<string, number>();
    (students || []).forEach((s) => {
      if (s.batch_id) {
        studentCountMap.set(s.batch_id, (studentCountMap.get(s.batch_id) || 0) + 1);
      }
    });

    const enriched = (batches || []).map((b) => ({
      ...b,
      courseName: courseMap.get(b.course_id) || 'General Program',
      enrolledCount: studentCountMap.get(b.id) || 0,
    }));

    return NextResponse.json({ success: true, batches: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, courseId, schedule, roomName, capacity, startDate, endDate, status } = body;

    if (!name || !courseId) {
      return NextResponse.json({ success: false, error: 'Batch name and Course selection are required' }, { status: 400 });
    }

    const batchId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('batches')
      .insert({
        id: batchId,
        name: name.trim(),
        course_id: courseId,
        schedule: schedule?.trim() || 'Mon-Fri 08:00 AM - 11:30 AM',
        room_name: roomName?.trim() || 'Hall A (Kalinga)',
        capacity: Number(capacity) || 50,
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate || null,
        status: status || 'ongoing',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, batch: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, courseId, schedule, roomName, capacity, startDate, endDate, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Batch ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (courseId !== undefined) updatePayload.course_id = courseId;
    if (schedule !== undefined) updatePayload.schedule = schedule.trim();
    if (roomName !== undefined) updatePayload.room_name = roomName.trim();
    if (capacity !== undefined) updatePayload.capacity = Number(capacity);
    if (startDate !== undefined) updatePayload.start_date = startDate;
    if (endDate !== undefined) updatePayload.end_date = endDate;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabaseAdmin
      .from('batches')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, batch: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Batch ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('batches').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
