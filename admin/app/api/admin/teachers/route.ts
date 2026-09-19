import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: teachers, error } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, email, phone');
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const enriched = (teachers || []).map((t) => {
      const p = profileMap.get(t.id);
      return {
        id: t.id,
        name: p?.full_name || 'Faculty Member',
        employeeId: t.employee_id,
        email: p?.email || '',
        phone: p?.phone || '',
        subject: t.subject,
        qualification: t.qualification || '',
        experienceYears: t.experience_years || 0,
        status: t.status || 'active',
        bio: t.bio || '',
      };
    });

    return NextResponse.json({ success: true, teachers: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, employeeId, email, phone, subject, qualification, experienceYears, bio, publishToWebsite } = body;

    if (!name || !employeeId || !subject) {
      return NextResponse.json({ success: false, error: 'Name, Employee ID, and Subject are required' }, { status: 400 });
    }

    const teacherUuid = crypto.randomUUID();
    const teacherEmail = email?.trim() || `faculty_${Date.now()}@oci.org.in`;

    // 1. Create Profile
    await supabaseAdmin.from('profiles').insert({
      id: teacherUuid,
      full_name: name.trim(),
      email: teacherEmail,
      phone: phone?.trim() || null,
    });

    // 2. Assign Role
    await supabaseAdmin.from('user_roles').insert({
      id: crypto.randomUUID(),
      user_id: teacherUuid,
      role: 'teacher',
    });

    // 3. Create Teacher
    const { data: teacher, error } = await supabaseAdmin
      .from('teachers')
      .insert({
        id: teacherUuid,
        employee_id: employeeId.trim().toUpperCase(),
        subject: subject.trim(),
        qualification: qualification?.trim() || null,
        experience_years: Number(experienceYears) || 5,
        bio: bio?.trim() || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Optionally sync with website_faculty
    if (publishToWebsite !== false) {
      await supabaseAdmin.from('website_faculty').insert({
        id: teacherUuid,
        name: name.trim(),
        subject: subject.trim(),
        qualification: qualification?.trim() || 'Master Degree / Specialist',
        experience_years: `${experienceYears || 5}+ Years`,
        biography: bio?.trim() || 'Dedicated academic mentor preparing students for competitive examinations.',
        display_order: 10,
        is_published: true,
      });
    }

    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Teacher ID is required' }, { status: 400 });
    }

    await supabaseAdmin.from('teachers').delete().eq('id', id);
    await supabaseAdmin.from('website_faculty').delete().eq('id', id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
