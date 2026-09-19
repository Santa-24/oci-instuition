import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      coursesRes,
      batchesRes,
      studentsRes,
      teachersRes,
      enquiriesRes,
      announcementsRes,
      examsRes,
      liveClassesRes,
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('id, name, code, category, is_active', { count: 'exact' }),
      supabaseAdmin.from('batches').select('id, name, course_id, schedule, room_name, capacity, status', { count: 'exact' }),
      supabaseAdmin.from('students').select('id, roll_no, batch_id, status', { count: 'exact' }),
      supabaseAdmin.from('teachers').select('id, employee_id, subject, status', { count: 'exact' }),
      supabaseAdmin.from('enquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(6),
      supabaseAdmin.from('announcements').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
      supabaseAdmin.from('exams').select('*', { count: 'exact' }),
      supabaseAdmin.from('live_classes').select('*', { count: 'exact' }),
    ]);

    const liveClasses = liveClassesRes.data || [];
    const activeLiveClasses = liveClasses.filter((l) => l.status === 'live');

    return NextResponse.json({
      success: true,
      stats: {
        coursesCount: coursesRes.count || (coursesRes.data?.length ?? 0),
        batchesCount: batchesRes.count || (batchesRes.data?.length ?? 0),
        studentsCount: studentsRes.count || (studentsRes.data?.length ?? 0),
        teachersCount: teachersRes.count || (teachersRes.data?.length ?? 0),
        enquiriesCount: enquiriesRes.count || (enquiriesRes.data?.length ?? 0),
        announcementsCount: announcementsRes.count || (announcementsRes.data?.length ?? 0),
        examsCount: examsRes.count || (examsRes.data?.length ?? 0),
        liveClassesToday: activeLiveClasses.length,
      },
      recentEnquiries: enquiriesRes.data || [],
      activeBatches: batchesRes.data || [],
      announcements: announcementsRes.data || [],
      exams: examsRes.data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to aggregate dashboard metrics' },
      { status: 500 }
    );
  }
}
