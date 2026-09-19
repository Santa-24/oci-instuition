import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: subjects, error } = await supabaseAdmin
      .from('subjects')
      .select('*, courses(name)')
      .order('name', { ascending: true });

    if (error) throw error;

    const enriched = (subjects || []).map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      courseId: s.course_id,
      courseName: s.courses?.name || 'General Curriculum',
      createdAt: s.created_at,
    }));

    return NextResponse.json({ success: true, subjects: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, courseId } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Subject name and code are required' }, { status: 400 });
    }

    const subjectId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        id: subjectId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        course_id: courseId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, subject: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Subject ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('subjects').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Subject deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
