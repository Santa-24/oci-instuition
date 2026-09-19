import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section'); // e.g. 'homepage', 'about', 'appSettings', 'testimonials', 'faculty', 'stories'

    if (!section) {
      // Return full website content bundle
      const { data, error } = await supabaseAdmin.from('website_content').select('*');
      if (error) throw error;
      const bundle: Record<string, any> = {};
      (data || []).forEach((row) => {
        bundle[row.key] = row.value;
      });
      return NextResponse.json({ success: true, bundle });
    }

    if (section === 'testimonials') {
      const { data, error } = await supabaseAdmin
        .from('website_testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, items: data || [] });
    }

    if (section === 'faculty') {
      const { data, error } = await supabaseAdmin
        .from('website_faculty')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ success: true, items: data || [] });
    }

    if (section === 'success_stories') {
      const { data, error } = await supabaseAdmin
        .from('website_success_stories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, items: data || [] });
    }

    // Default to website_content key-value store
    const { data, error } = await supabaseAdmin
      .from('website_content')
      .select('value')
      .eq('key', section)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return NextResponse.json({ success: true, value: data?.value || null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: 'Key and Value are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('website_content')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, saved: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
