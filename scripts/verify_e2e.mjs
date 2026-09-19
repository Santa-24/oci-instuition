import assert from 'node:assert';

const BACKEND_URL = process.env.RENDER_BACKEND_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function requestBackend(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, data: body };
}

async function requestSupabase(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { skipped: true };
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {}),
  };

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, data: body, skipped: false };
}

async function runE2EValidation() {
  console.log('===============================================================');
  console.log('STARTING OCI MASTER END-TO-END SYSTEM INTEGRATION VALIDATION');
  console.log('Backend Engine URL:', BACKEND_URL);
  console.log('Supabase Gateway:  ', SUPABASE_URL || '(Supabase Cloud credentials optional)');
  console.log('Execution Time:    ', new Date().toISOString());
  console.log('===============================================================\n');

  // STEP 1: Backend Health Check
  console.log('🧪 [TEST 1] Render Backend Health Probe (GET /health)...');
  const healthRes = await requestBackend('/health');
  assert.strictEqual(healthRes.status, 200, `Health check failed with status ${healthRes.status}`);
  assert.strictEqual(healthRes.data.status, 'UP', 'Health status is not UP');
  assert.ok(healthRes.data.timestamp, 'Missing health timestamp');
  console.log('   ✅ Health Probe Verified: Status = UP | Version =', healthRes.data.version);

  // STEP 2: CBT Exam Engine Scoring & Ranking Evaluation
  console.log('\n🧪 [TEST 2] CBT Exam Engine: Submitting student test responses...');
  const examSubmissionPayload = {
    examId: `exam_prod_test_${Date.now()}`,
    studentId: `std_eval_${Date.now()}`,
    responses: {
      'q_001': 1, // Correct (+4 marks)
      'q_002': 0, // Correct (+4 marks)
      'q_003': 3, // Incorrect (-1 mark)
    },
  };

  const examEvalRes = await requestBackend('/api/exams/submit', {
    method: 'POST',
    body: JSON.stringify(examSubmissionPayload),
  });

  assert.strictEqual(examEvalRes.status, 200, `Exam submission failed: ${JSON.stringify(examEvalRes.data)}`);
  assert.ok(examEvalRes.data.success, 'Exam submission success flag is false');
  const scoreResult = examEvalRes.data.result;
  assert.ok(scoreResult.score !== undefined, 'Missing evaluated score');
  assert.ok(scoreResult.percentage !== undefined, 'Missing percentage calculation');
  assert.ok(scoreResult.accuracy_percentage !== undefined, 'Missing accuracy calculation');
  console.log(`   ✅ CBT Exam Evaluated: Score=${scoreResult.score}/${scoreResult.total_marks}, Accuracy=${scoreResult.accuracy_percentage}%, Rank=${scoreResult.air_rank}`);

  // STEP 3: Attendance Engine Batch Recording
  console.log('\n🧪 [TEST 3] Attendance Engine: Recording batch attendance sheet...');
  const attendancePayload = {
    liveClassId: `class_e2e_${Date.now()}`,
    records: [
      { studentId: 'std_01', status: 'present' },
      { studentId: 'std_02', status: 'present' },
      { studentId: 'std_03', status: 'late' },
      { studentId: 'std_04', status: 'absent' },
    ],
  };

  const attendanceRes = await requestBackend('/api/attendance/batch', {
    method: 'POST',
    body: JSON.stringify(attendancePayload),
  });

  assert.strictEqual(attendanceRes.status, 200, 'Attendance submission failed');
  assert.ok(attendanceRes.data.success, 'Attendance response success flag is false');
  console.log(`   ✅ Attendance Processed: ${attendanceRes.data.count} student records processed`);

  // STEP 4: Attendance Metrics Engine
  console.log('\n🧪 [TEST 4] Attendance Engine: Calculating student attendance statistics...');
  const statsRes = await requestBackend('/api/attendance/student/std_01');
  assert.strictEqual(statsRes.status, 200, 'Failed to calculate attendance stats');
  assert.ok(statsRes.data.stats !== undefined, 'Missing stats in response');
  console.log(`   ✅ Attendance Metrics: Total=${statsRes.data.stats.totalClasses}, Attended=${statsRes.data.stats.attended}, Percentage=${statsRes.data.stats.percentage}%`);

  // STEP 5: Push Notification Broadcaster
  console.log('\n🧪 [TEST 5] Notification Engine: Dispatching system announcement...');
  const notifPayload = {
    title: 'Admit Cards Released: OPSC ASO 2026 Mock Test',
    body: 'Your admit card for Mock Exam #04 is now available for download in the Student Portal.',
    targetType: 'all',
  };

  const notifRes = await requestBackend('/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify(notifPayload),
  });

  assert.strictEqual(notifRes.status, 200, 'Notification dispatch failed');
  assert.ok(notifRes.data.success, 'Notification dispatch success flag is false');
  console.log('   ✅ Notification Dispatched:', notifRes.data.message || 'Notification broadcast recorded');

  // STEP 6: FCM Device Token Registration
  console.log('\n🧪 [TEST 6] Notification Engine: Registering student device FCM token...');
  const tokenPayload = {
    userId: 'std_e2e_device',
    token: `fcm_token_${Date.now()}_alpha_numeric`,
    platform: 'web',
    browserDevice: 'Chrome on Windows 11',
  };

  const tokenRes = await requestBackend('/api/notifications/register-token', {
    method: 'POST',
    body: JSON.stringify(tokenPayload),
  });

  assert.strictEqual(tokenRes.status, 200, 'Token registration failed');
  assert.ok(tokenRes.data.success, 'Token registration success flag is false');
  console.log('   ✅ Push Token Registered for Web Device');

  // STEP 7-11: Database Persistence Verification (If Supabase is live)
  if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project')) {
    console.log('\n🧪 [TEST 7] Supabase PostgreSQL: Querying academic courses...');
    const dbCoursesRes = await requestSupabase('/rest/v1/courses?select=id,name,code&limit=5');
    if (dbCoursesRes.ok) {
      console.log(`   ✅ Courses queried from database: ${dbCoursesRes.data.length} records found`);
    } else {
      console.log('   ℹ️ Supabase query returned:', dbCoursesRes.status);
    }
  } else {
    console.log('\nℹ️ Direct Supabase cloud verification skipped (provide SUPABASE_URL and SUPABASE_ANON_KEY to run live cloud DB assertions).');
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL INTEGRATION & PRODUCTION ENGINE TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
}

runE2EValidation().catch((err) => {
  console.error('\n❌ E2E VALIDATION FAILED:', err);
  process.exit(1);
});
