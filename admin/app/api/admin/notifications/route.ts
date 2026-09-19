import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (notifications || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      target: n.type || 'All Students',
      sentAt: n.created_at,
      deliveryCount: 'Broadcasted to Active Devices',
    }));

    return NextResponse.json({ success: true, notifications: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: notifBody, target } = body;

    if (!title || !notifBody) {
      return NextResponse.json({ success: false, error: 'Title and message body are required' }, { status: 400 });
    }

    const notifId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        id: notifId,
        title: title.trim(),
        body: notifBody.trim(),
        type: target || 'NOTICE',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, notification: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
