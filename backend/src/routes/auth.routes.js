import { Router } from 'express';
import { getSupabaseClient } from '../config/supabase.js';

const router = Router();

router.get('/api/auth/resolve-identifier', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Identifier is required' });
    }

    const trimmed = id.trim();
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database service unavailable' });
    }

    // 1. Check if identifier is an Employee ID (FAC-XXX)
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, employee_id')
      .ilike('employee_id', trimmed)
      .maybeSingle();

    if (teacher) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', teacher.id)
        .maybeSingle();

      if (profile?.email) {
        return res.json({ success: true, email: profile.email, type: 'faculty' });
      }
    }

    // 2. Check if identifier is a Student Roll Number (OCI-XXX)
    const { data: student } = await supabase
      .from('students')
      .select('id, roll_no')
      .ilike('roll_no', trimmed)
      .maybeSingle();

    if (student) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', student.id)
        .maybeSingle();

      if (profile?.email) {
        return res.json({ success: true, email: profile.email, type: 'student' });
      }
    }

    return res.status(404).json({ success: false, error: 'Identifier not found' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
