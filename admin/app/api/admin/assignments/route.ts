import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('assignments')
      .select('*, batches(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (assignments || []).map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      description: a.description || '',
      batchId: a.batch_id,
      batchName: a.batches?.name || 'All Batches',
      dueDate: a.due_date,
      status: a.status || 'active',
      createdAt: a.created_at,
    }));

    return NextResponse.json({ success: true, assignments: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, batchId, description, dueDate } = body;

    if (!title || !subject) {
      return NextResponse.json({ success: false, error: 'Title and subject are required' }, { status: 400 });
    }

    const assignmentId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        id: assignmentId,
        title: title.trim(),
        subject: subject.trim(),
        batch_id: batchId || null,
        description: description?.trim() || null,
        due_date: dueDate || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, assignment: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Assignment ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('assignments').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
