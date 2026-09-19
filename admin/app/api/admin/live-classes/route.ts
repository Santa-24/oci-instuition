import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: classes, error } = await supabaseAdmin
      .from('live_classes')
      .select('*, batches(name, courses(name))')
      .order('scheduled_start', { ascending: false });

    if (error) throw error;

    const enriched = (classes || []).map((c) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      courseName: c.batches?.courses?.name || 'Academic Course',
      batchId: c.batch_id,
      batchName: c.batches?.name || 'All Batches',
      teacherId: c.teacher_id,
      teacherName: 'OCI Faculty Lead',
      scheduledStartTime: c.scheduled_start,
      scheduledEndTime: c.scheduled_end,
      status: c.status || 'scheduled',
      jitsiRoomName: c.jitsi_room_name,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, liveClasses: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, batchId, scheduledStart, scheduledEnd } = body;

    if (!title || !subject) {
      return NextResponse.json({ success: false, error: 'Title and subject are required' }, { status: 400 });
    }

    const classId = crypto.randomUUID();
    const jitsiRoom = `oci_live_${Date.now()}`;
    const start = scheduledStart || new Date().toISOString();
    const end = scheduledEnd || new Date(Date.now() + 90 * 60000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .insert({
        id: classId,
        title: title.trim(),
        subject: subject.trim(),
        batch_id: batchId || null,
        scheduled_start: start,
        scheduled_end: end,
        jitsi_room_name: jitsiRoom,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, liveClass: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Class ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('live_classes').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Live class deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
