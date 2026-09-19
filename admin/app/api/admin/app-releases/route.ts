import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: releases, error } = await supabaseAdmin
      .from('app_versions')
      .select('*')
      .order('version_code', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, releases: releases || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      versionName,
      versionCode,
      apkUrl,
      releaseNotes,
      isMandatory,
      minVersion,
      fileSizeBytes,
      checksumSha256,
      platform,
    } = body;

    if (!versionName || !versionCode || !apkUrl) {
      return NextResponse.json(
        { success: false, error: 'Version name, version code, and APK URL are required.' },
        { status: 400 }
      );
    }

    const notesArray = Array.isArray(releaseNotes)
      ? releaseNotes
      : typeof releaseNotes === 'string'
      ? releaseNotes.split('\n').map((s) => s.trim()).filter(Boolean)
      : ['General performance improvements and stability updates.'];

    const { data, error } = await supabaseAdmin
      .from('app_versions')
      .insert({
        id: crypto.randomUUID(),
        platform: platform || 'android',
        version_name: versionName.trim(),
        version_code: Number(versionCode),
        apk_url: apkUrl.trim(),
        release_notes: notesArray,
        is_mandatory: Boolean(isMandatory),
        minimum_supported_version: minVersion || '1.0.0',
        file_size_bytes: fileSizeBytes ? Number(fileSizeBytes) : 36700160,
        checksum_sha256: checksumSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        is_active: true,
        released_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, release: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active, is_mandatory } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Release ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);
    if (is_mandatory !== undefined) updatePayload.is_mandatory = Boolean(is_mandatory);

    const { data, error } = await supabaseAdmin
      .from('app_versions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, release: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Release ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('app_versions').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Release deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
