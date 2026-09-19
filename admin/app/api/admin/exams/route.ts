import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: exams, error } = await supabaseAdmin
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: courses } = await supabaseAdmin.from('courses').select('id, name');
    const courseMap = new Map((courses || []).map((c) => [c.id, c.name]));

    const enriched = (exams || []).map((e) => ({
      ...e,
      courseName: courseMap.get(e.course_id) || 'General Competitive Track',
      isPublished: Boolean(e.is_published),
      durationMinutes: e.duration_minutes || 180,
      totalMarks: e.total_marks || 200,
    }));

    return NextResponse.json({ success: true, exams: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, courseId, durationMinutes, totalMarks, scheduledDate, isPublished } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Exam title is required' }, { status: 400 });
    }

    // Resolve courseId or fallback to first available course
    let targetCourseId = courseId;
    if (!targetCourseId) {
      const { data: c } = await supabaseAdmin.from('courses').select('id').limit(1).single();
      targetCourseId = c?.id || null;
    }

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .insert({
        id: crypto.randomUUID(),
        course_id: targetCourseId,
        title: title.trim(),
        duration_minutes: Number(durationMinutes) || 180,
        total_marks: Number(totalMarks) || 200,
        is_published: isPublished !== undefined ? Boolean(isPublished) : true,
        scheduled_date: scheduledDate || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isPublished, title, durationMinutes, totalMarks } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Exam ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (isPublished !== undefined) updatePayload.is_published = Boolean(isPublished);
    if (title !== undefined) updatePayload.title = title.trim();
    if (durationMinutes !== undefined) updatePayload.duration_minutes = Number(durationMinutes);
    if (totalMarks !== undefined) updatePayload.total_marks = Number(totalMarks);

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Exam ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('exams').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
