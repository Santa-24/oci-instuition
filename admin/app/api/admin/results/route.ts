import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: results, error } = await supabaseAdmin
      .from('exam_results')
      .select('*')
      .order('score', { ascending: false });

    if (error) throw error;

    // Fetch exams & students for enrichment
    const [examsRes, studentsRes] = await Promise.all([
      supabaseAdmin.from('exams').select('id, title, total_marks'),
      supabaseAdmin.from('students').select('id, roll_no, profiles(full_name)'),
    ]);

    const examMap = new Map<string, any>();
    (examsRes.data || []).forEach((e) => examMap.set(e.id, e));

    const studentMap = new Map<string, any>();
    (studentsRes.data || []).forEach((s) => studentMap.set(s.id, s));

    const enriched = (results || []).map((r, index) => {
      const exam = examMap.get(r.exam_id);
      const student = studentMap.get(r.student_id);
      const studentName = student?.profiles?.full_name || 'Enrolled Student';
      const rollNo = student?.roll_no || 'OCI-ROLL';
      const examTitle = exam?.title || 'Mock Examination';
      const totalMarks = r.total_marks || exam?.total_marks || 300;

      return {
        id: r.id,
        examId: r.exam_id,
        examTitle,
        studentId: r.student_id,
        student: studentName,
        roll: rollNo,
        score: r.score,
        total: totalMarks,
        accuracy: r.accuracy_percentage ? `${r.accuracy_percentage}%` : 'N/A',
        rank: r.air_rank ? `AIR ${r.air_rank}` : `Rank ${index + 1}`,
        percentile: r.percentile ? Number(r.percentile).toFixed(2) : '95.00',
        submittedAt: r.submitted_at || r.created_at,
      };
    });

    return NextResponse.json({ success: true, results: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, studentId, score, totalMarks, accuracyPercentage, airRank, percentile } = body;

    if (!examId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Exam ID and Score are required' },
        { status: 400 }
      );
    }

    const resultId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .insert({
        id: resultId,
        exam_id: examId,
        student_id: studentId || null,
        score: Number(score),
        total_marks: Number(totalMarks) || 200,
        accuracy_percentage: accuracyPercentage ? Number(accuracyPercentage) : null,
        air_rank: airRank ? Number(airRank) : null,
        percentile: percentile ? Number(percentile) : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, result: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Result ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('exam_results').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Result deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
