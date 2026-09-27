import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyAdminRequest } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || 'settings_general';

    const { data, error } = await supabaseAdmin
      .from('website_content')
      .select('key, content, updated_at')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      key,
      data: data?.content || null,
      updatedAt: data?.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const { key, content } = body;

    if (!key || !content) {
      return NextResponse.json(
        { success: false, error: 'Settings key and content payload required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('website_content')
      .upsert({
        key,
        content,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      key,
      data: data.content,
      updatedAt: data.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
