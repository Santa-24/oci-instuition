import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: recordings, error } = await supabaseAdmin
      .from('recorded_classes')
      .select('*, batches(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (recordings || []).map((r) => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      batchId: r.batch_id,
      batchName: r.batches?.name || 'All Batches',
      videoUrl: r.video_url,
      thumbnailUrl: r.thumbnail_url,
      durationSeconds: r.duration_seconds || 3600,
      duration: `${Math.round((r.duration_seconds || 3600) / 60)} mins`,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, recordings: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, batchId, videoUrl, durationMinutes } = body;

    if (!title || !subject || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, subject, and video URL are required' },
        { status: 400 }
      );
    }

    const recordingId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('recorded_classes')
      .insert({
        id: recordingId,
        title: title.trim(),
        subject: subject.trim(),
        batch_id: batchId || null,
        video_url: videoUrl.trim(),
        duration_seconds: (Number(durationMinutes) || 60) * 60,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, recording: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Recording ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('recorded_classes').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Recording deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
