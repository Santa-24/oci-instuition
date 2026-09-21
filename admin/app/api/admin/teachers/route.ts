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
    const { name, employeeId, email, phone, subject, qualification, experienceYears, bio, publishToWebsite, password } = body;

    if (!name || !employeeId || !subject) {
      return NextResponse.json({ success: false, error: 'Name, Employee ID, and Subject are required' }, { status: 400 });
    }

    const teacherEmail = email?.trim().toLowerCase() || `faculty_${Date.now()}@oci.edu.in`;
    const tempPassword = password?.trim() || 'Faculty@123';
    if (tempPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Create real Supabase Auth user for faculty
    let teacherUuid: string;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: teacherEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        role: 'teacher',
      },
    });

    if (authError || !authUser?.user) {
      // If user already exists in auth, find their ID and ensure password/role are set
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email?.toLowerCase() === teacherEmail.toLowerCase());
      if (existing) {
        teacherUuid = existing.id;
        await supabaseAdmin.auth.admin.updateUserById(teacherUuid, {
          password: tempPassword,
          user_metadata: {
            full_name: name.trim(),
            role: 'teacher',
            employee_id: employeeId.trim(),
          },
        });
      } else {
        teacherUuid = crypto.randomUUID();
      }
    } else {
      teacherUuid = authUser.user.id;
    }

    // 2. Upsert Profile
    await supabaseAdmin.from('profiles').upsert({
      id: teacherUuid,
      full_name: name.trim(),
      email: teacherEmail,
      phone: phone?.trim() || null,
      role: 'teacher',
    });

    // 3. Upsert Role
    await supabaseAdmin.from('user_roles').upsert(
      {
        user_id: teacherUuid,
        role: 'teacher',
      },
      { onConflict: 'user_id' }
    );

    // 4. Create Teacher Record
    const { data: teacher, error } = await supabaseAdmin
      .from('teachers')
      .upsert({
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
    await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (_) {
      // Ignored if auth user not found
    }

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json({ success: false, error: 'Teacher ID and new password are required' }, { status: 400 });
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: trimmedPassword,
    });

    if (authError) throw authError;

    // 2. Touch teachers updated_at
    await supabaseAdmin
      .from('teachers')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Faculty password updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
