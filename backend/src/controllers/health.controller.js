import { ENV } from '../config/env.js';
import { getSupabaseClient } from '../config/supabase.js';
import { Cache } from '../config/redis.js';
import { FCM } from '../config/firebase.js';

export async function healthCheck(req, res) {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  // Non-blocking subsystem check
  let dbStatus = 'NOT_CONFIGURED';
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('courses').select('id').limit(1);
      dbStatus = error ? 'DEGRADED' : 'UP';
    }
  } catch (_) {
    dbStatus = 'DOWN';
  }

  return res.status(200).json({
    status: 'UP',
    institute: 'Odisha Competitive Institute (OCI)',
    version: '1.0.0',
    uptime: `${Math.floor(uptime)}s`,
    timestamp,
    environment: ENV.NODE_ENV,
    subsystems: {
      database: dbStatus,
      cache: Cache.hasRedis ? 'UP' : 'IN_MEMORY_ACTIVE',
      notifications: FCM.isConfigured ? 'READY' : 'LOCAL_STORAGE_ACTIVE',
    },
  });
}
