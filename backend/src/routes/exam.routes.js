import { Router } from 'express';
import { ExamEngine } from '../services/exam-engine.js';

const router = Router();

// Submit student exam answers
router.post('/submit', async (req, res) => {
  try {
    const { examId, studentId, responses } = req.body;
    if (!examId || !studentId) {
      return res.status(400).json({ error: 'examId and studentId are required' });
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
