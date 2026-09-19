import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: materials, error } = await supabaseAdmin
      .from('study_materials')
      .select('*, batches(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (materials || []).map((m) => ({
      id: m.id,
      title: m.title,
      subject: m.subject,
      batchId: m.batch_id,
      batchName: m.batches?.name || 'All Batches',
      type: m.type || 'PDF',
      fileUrl: m.file_url,
      fileSize: m.file_size || 'N/A',
      downloadCount: m.download_count || 0,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, materials: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, batchId, fileUrl, fileSize, type } = body;

    if (!title || !subject) {
      return NextResponse.json({ success: false, error: 'Title and subject are required' }, { status: 400 });
    }

    const materialId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .insert({
        id: materialId,
        title: title.trim(),
        subject: subject.trim(),
        batch_id: batchId || null,
        file_url: fileUrl?.trim() || '#',
        file_size: fileSize || '1.5 MB',
        type: type || 'PDF',
        download_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, material: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Material ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('study_materials').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Material deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
