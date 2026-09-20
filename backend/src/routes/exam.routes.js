import { Router } from 'express';
import { ExamEngine } from '../services/exam-engine.js';
import { ENV } from '../config/env.js';

const router = Router();

// Submit student exam answers with identity verification
router.post('/submit', async (req, res) => {
  try {
    const { examId, studentId, responses } = req.body;
    if (!examId || !studentId) {
      return res.status(400).json({ error: 'examId and studentId are required' });
    }

    // IDOR Protection: If an authorization token is provided, enforce that caller matches studentId
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (ENV.SUPABASE_URL && ENV.SUPABASE_SECRET_KEY) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY);
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
          }
          if (user.id !== studentId) {
            return res.status(403).json({ error: 'Forbidden: Cannot submit exam answers for another student' });
          }
        } catch (e) {
          console.warn('[Exam Submit Auth Check Failed]:', e.message);
        }
      }
    }

    const result = await ExamEngine.evaluateSubmission({ examId, studentId, responses });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('[Exam Submission Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Fetch leaderboard / rankings for an exam
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const leaderboard = await ExamEngine.getLeaderboard(req.params.id);
    return res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
