import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export interface SearchResultItem {
  id: string;
  category: 'Students' | 'Faculty' | 'Courses' | 'Batches' | 'Live Classes' | 'Exams' | 'Assignments' | 'Enquiries';
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const [
      studentsRes,
      teachersRes,
      coursesRes,
      batchesRes,
      classesRes,
      examsRes,
      assignmentsRes,
      enquiriesRes,
    ] = await Promise.all([
      // Students with profiles
      supabaseAdmin
        .from('students')
        .select('id, roll_no, profiles(full_name, email, phone)')
        .limit(20),
      // Teachers with profiles
      supabaseAdmin
        .from('teachers')
        .select('id, employee_id, subject, profiles(full_name, email)')
        .limit(20),
      // Courses
      supabaseAdmin
        .from('courses')
        .select('id, name, code, category')
        .ilike('name', `%${query}%`)
        .limit(5),
      // Batches
      supabaseAdmin
        .from('batches')
        .select('id, name, room_name, schedule')
        .ilike('name', `%${query}%`)
        .limit(5),
      // Live classes
      supabaseAdmin
        .from('live_classes')
        .select('id, title, subject, status')
        .ilike('title', `%${query}%`)
        .limit(5),
      // Exams
      supabaseAdmin
        .from('exams')
        .select('id, title, is_published')
        .ilike('title', `%${query}%`)
        .limit(5),
      // Assignments
      supabaseAdmin
        .from('assignments')
        .select('id, title, subject')
        .ilike('title', `%${query}%`)
        .limit(5),
      // Enquiries
      supabaseAdmin
        .from('enquiries')
        .select('id, name, phone, interested_course, status')
        .ilike('name', `%${query}%`)
        .limit(5),
    ]);

    const results: SearchResultItem[] = [];

    // Filter Students
    (studentsRes.data || []).forEach((s: any) => {
      const name = s.profiles?.full_name || 'Student';
      const roll = s.roll_no || '';
      const email = s.profiles?.email || '';
      if (
        name.toLowerCase().includes(query) ||
        roll.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      ) {
        results.push({
          id: s.id,
          category: 'Students',
          title: name,
          subtitle: `Roll: ${roll} • ${email}`,
          href: `/admin/students/${s.id}`,
          badge: roll,
        });
      }
    });

    // Filter Faculty
    (teachersRes.data || []).forEach((t: any) => {
      const name = t.profiles?.full_name || 'Faculty Member';
      const empId = t.employee_id || '';
      const subject = t.subject || '';
      if (
        name.toLowerCase().includes(query) ||
        empId.toLowerCase().includes(query) ||
        subject.toLowerCase().includes(query)
      ) {
        results.push({
          id: t.id,
          category: 'Faculty',
          title: name,
          subtitle: `${empId} • ${subject}`,
          href: '/admin/teachers',
          badge: subject,
        });
      }
    });

    // Courses
    (coursesRes.data || []).forEach((c: any) => {
      results.push({
        id: c.id,
        category: 'Courses',
        title: c.name,
        subtitle: `${c.code} • ${c.category}`,
        href: '/admin/courses',
        badge: c.category,
      });
    });

    // Batches
    (batchesRes.data || []).forEach((b: any) => {
      results.push({
        id: b.id,
        category: 'Batches',
        title: b.name,
        subtitle: `${b.room_name} • ${b.schedule}`,
        href: '/admin/batches',
      });
    });

    // Live Classes
    (classesRes.data || []).forEach((l: any) => {
      results.push({
        id: l.id,
        category: 'Live Classes',
        title: l.title,
        subtitle: l.subject,
        href: '/admin/live-classes',
        badge: l.status,
      });
    });

    // Exams
    (examsRes.data || []).forEach((e: any) => {
      results.push({
        id: e.id,
        category: 'Exams',
        title: e.title,
        subtitle: e.is_published ? 'Published' : 'Draft',
        href: '/admin/mock-exams',
        badge: e.is_published ? 'Published' : 'Draft',
      });
    });

    // Assignments
    (assignmentsRes.data || []).forEach((a: any) => {
      results.push({
        id: a.id,
        category: 'Assignments',
        title: a.title,
        subtitle: a.subject,
        href: '/admin/assignments',
      });
    });

    // Enquiries
    (enquiriesRes.data || []).forEach((enq: any) => {
      results.push({
        id: enq.id,
        category: 'Enquiries',
        title: enq.name,
        subtitle: `${enq.phone} • ${enq.interested_course}`,
        href: '/admin/enquiries',
        badge: enq.status,
      });
    });

    return NextResponse.json({
      success: true,
      results: results.slice(0, 15),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Global search failed' },
      { status: 500 }
    );
  }
}
