import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, examInterested, message } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'Full Name and Phone Number are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('enquiries')
      .insert({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        interested_course: examInterested || 'General Enquiry',
        message: message ? message.trim() : 'Website admission inquiry',
        source: 'Website Form',
        status: 'NEW',
      })
      .select()
      .single();

    if (error) {
      console.error('[Public Website Contact Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, enquiryId: data?.id });
  } catch (error: any) {
    console.error('[Public Website Contact Exception]:', error);
    return NextResponse.json({ error: 'Failed to process enquiry' }, { status: 500 });
  }
}
