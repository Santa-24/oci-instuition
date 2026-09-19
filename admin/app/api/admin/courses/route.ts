import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get batch counts per course
    const { data: batches } = await supabaseAdmin.from('batches').select('id, course_id');
    const batchCountMap = new Map<string, number>();
    (batches || []).forEach((b) => {
      if (b.course_id) {
        batchCountMap.set(b.course_id, (batchCountMap.get(b.course_id) || 0) + 1);
      }
    });

    const enriched = (courses || []).map((c) => ({
      ...c,
      batchesCount: batchCountMap.get(c.id) || 0,
      isActive: Boolean(c.is_active),
    }));

    return NextResponse.json({ success: true, courses: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, category, durationMonths, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Course name and code are required' }, { status: 400 });
    }

    const courseId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id: courseId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category: category || 'State Recruitment',
        duration_months: Number(durationMonths) || 12,
        description: description?.trim() || null,
        is_active: isActive !== undefined ? Boolean(isActive) : true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, course: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, code, category, durationMonths, description, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required for updates' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (code !== undefined) updatePayload.code = code.trim().toUpperCase();
    if (category !== undefined) updatePayload.category = category;
    if (durationMonths !== undefined) updatePayload.duration_months = Number(durationMonths);
    if (description !== undefined) updatePayload.description = description;
    if (isActive !== undefined) updatePayload.is_active = Boolean(isActive);

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, course: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
