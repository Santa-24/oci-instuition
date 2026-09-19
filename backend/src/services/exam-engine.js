import { getSupabaseClient } from '../config/supabase.js';

export const ExamEngine = {
  /**
   * Evaluates student's CBT responses against the Question Bank,
   * calculates positive marks, negative penalties, accuracy, and All India Rank (AIR).
   */
  async evaluateSubmission({ examId, studentId, responses }) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // In-memory evaluation fallback if Supabase not yet connected
      let score = 0;
      let correctCount = 0;
      let attemptedCount = 0;
      for (const [qId, optionIdx] of Object.entries(responses || {})) {
        if (optionIdx !== null && optionIdx !== undefined) {
          attemptedCount++;
          // Fallback test logic
          if (optionIdx === 0 || optionIdx === 1) {
            score += 4;
            correctCount++;
          } else {
            score -= 1;
          }
        }
      }
      return {
        id: `res_mem_${Date.now()}`,
        exam_id: examId,
        student_id: studentId,
        score,
        total_marks: 300,
        percentage: Number(((score / 300) * 100).toFixed(2)),
        accuracy_percentage: attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(2)) : 0,
        air_rank: 1,
        responses,
        submitted_at: new Date().toISOString(),
      };
    }

    // 1. Fetch Exam metadata
    const { data: exam, error: examErr } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examErr || !exam) {
      throw new Error(`Exam not found: ${examId}`);
    }

    // 2. Fetch Questions
    const questionIds = Object.keys(responses || {});
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    const questionMap = new Map((questions || []).map(q => [q.id, q]));

    let calculatedScore = 0;
    let correctCount = 0;
    let attemptedCount = 0;

    for (const [qId, selectedOption] of Object.entries(responses)) {
      if (selectedOption === null || selectedOption === undefined) continue;
      attemptedCount++;

      const question = questionMap.get(qId);
      const marks = question?.marks || 4;
      const negativeMarks = question?.negative_marks || 1;
      const correctIdx = question?.correct_option_index;

      if (Number(selectedOption) === correctIdx) {
        calculatedScore += marks;
        correctCount++;
      } else {
        calculatedScore -= negativeMarks;
      }
    }

    const totalMarks = exam.total_marks || 300;
    const percentage = Number(((calculatedScore / totalMarks) * 100).toFixed(2));
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;

    // 3. Upsert into exam_results
    const resultPayload = {
      exam_id: examId,
      student_id: studentId,
      score: calculatedScore,
      total_marks: totalMarks,
      percentage,
      accuracy_percentage: accuracy,
      responses,
      submitted_at: new Date().toISOString(),
    };

    const { data: savedResult, error: saveErr } = await supabase
      .from('exam_results')
      .upsert(resultPayload, { onConflict: 'exam_id, student_id' })
      .select()
      .single();

    if (saveErr) {
      throw new Error(`Failed to record exam result: ${saveErr.message}`);
    }

    // 4. Recalculate AIR Rankings
    try {
      await supabase.rpc('calculate_exam_air_rankings', { p_exam_id: examId });
      // Fetch updated rank
      const { data: ranked } = await supabase
        .from('exam_results')
        .select('air_rank')
        .eq('id', savedResult.id)
        .single();
      if (ranked) savedResult.air_rank = ranked.air_rank;
    } catch (_) {
      // If RPC not available, rank defaults to 1
      savedResult.air_rank = 1;
    }

    return savedResult;
  },

  async getLeaderboard(examId) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        id,
        score,
        total_marks,
        percentage,
        accuracy_percentage,
        air_rank,
        submitted_at,
        student:students(
          roll_no,
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq('exam_id', examId)
      .order('air_rank', { ascending: true })
      .limit(50);

    if (error) throw error;
    return data;
  }
};
