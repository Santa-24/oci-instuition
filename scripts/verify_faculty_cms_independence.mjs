import { createClient } from '../admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runFacultyIndependenceTest() {
  console.log("=== TESTING OPERATIONAL TEACHERS VS WEBSITE FACULTY CMS INDEPENDENCE ===");

  // 1. Check initial website_faculty count
  const { data: initialWebFaculty } = await adminClient.from('website_faculty').select('id');
  const initialWebCount = initialWebFaculty?.length || 0;
  console.log(`[1] Initial website_faculty profiles count: ${initialWebCount}`);

  // 2. Create an operational teacher account
  const testEmail = `operational.faculty.${Date.now()}@oci.edu.in`;
  const testEmpId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
  console.log(`[2] Provisioning operational teacher account: ${testEmail} (${testEmpId})`);

  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: "FacultyPassword123!",
    email_confirm: true,
    user_metadata: { full_name: "Dr. Operational Independence Faculty" }
  });

  if (authErr) throw new Error(`Auth creation failed: ${authErr.message}`);
  const teacherId = authUser.user.id;

  await adminClient.from('profiles').upsert({
    id: teacherId,
    email: testEmail,
    full_name: "Dr. Operational Independence Faculty",
    phone: "+91 94370 99999",
  });

  await adminClient.from('user_roles').upsert({
    user_id: teacherId,
    role: 'teacher',
  }, { onConflict: 'user_id' });

  await adminClient.from('teachers').upsert({
    id: teacherId,
    employee_id: testEmpId,
    subject: "Advanced Mathematics",
    qualification: "Ph.D Mathematics",
    experience_years: 10,
    status: 'active',
  });

  console.log(`  ✓ Operational teacher record created in 'teachers' table (ID: ${teacherId})`);

  // 3. Verify website_faculty count has NOT increased
  const { data: postCreateWebFaculty } = await adminClient.from('website_faculty').select('id');
  const postCreateCount = postCreateWebFaculty?.length || 0;
  console.log(`[3] Post-creation website_faculty profiles count: ${postCreateCount}`);

  if (postCreateCount !== initialWebCount) {
    throw new Error(`VIOLATION: website_faculty was automatically mutated! Expected ${initialWebCount}, got ${postCreateCount}`);
  }
  console.log("  ✓ website_faculty was NOT mutated by operational teacher account creation (Independent!)");

  // 4. Clean up test teacher
  console.log("[4] Cleaning up operational test teacher...");
  await adminClient.from('teachers').delete().eq('id', teacherId);
  await adminClient.from('user_roles').delete().eq('user_id', teacherId);
  await adminClient.from('profiles').delete().eq('id', teacherId);
  await adminClient.auth.admin.deleteUser(teacherId);

  // 5. Verify website_faculty count remains untouched
  const { data: postDeleteWebFaculty } = await adminClient.from('website_faculty').select('id');
  const postDeleteCount = postDeleteWebFaculty?.length || 0;
  if (postDeleteCount !== initialWebCount) {
    throw new Error(`VIOLATION: website_faculty was altered after teacher deletion!`);
  }
  console.log(`  ✓ website_faculty count remains strictly unchanged at ${postDeleteCount}`);

  console.log("=== ALL FACULTY CMS INDEPENDENCE CHECKS PASSED! ===");
}

runFacultyIndependenceTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
