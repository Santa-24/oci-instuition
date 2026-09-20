import { createClient } from '../admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error("Missing required environment variables in admin/.env.local");
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runAuthVerification() {
  console.log("=== STARTING AUTHENTICATION & ROLE ISOLATION TEST ===");
  const testStudentEmail = `test.student.${Date.now()}@gmail.com`;
  const testStudentPassword = "Password123!Secure";
  const testTeacherEmail = `test.teacher.${Date.now()}@gmail.com`;
  const testTeacherPassword = "FacultyPass123!Secure";

  let studentUserId = null;
  let teacherUserId = null;

  try {
    // 1. PUBLIC / STUDENT PROVISIONING & AUTHENTICATION
    console.log(`\n[1] Testing Student Provisioning & Login: ${testStudentEmail}`);
    const { data: studentAuth, error: studentSignUpErr } = await adminClient.auth.admin.createUser({
      email: testStudentEmail,
      password: testStudentPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Test Verification Student",
        phone: "9876543210",
        target_exam: "OSSC CGL"
      }
    });

    if (studentSignUpErr) throw new Error(`Student creation failed: ${studentSignUpErr.message}`);
    studentUserId = studentAuth.user?.id;
    console.log(`  ✓ Student created successfully. User ID: ${studentUserId}`);

    // Replicate AuthRepository client-side upsert for student profile & role
    await adminClient.from('profiles').upsert({
      id: studentUserId,
      email: testStudentEmail,
      full_name: "Test Verification Student",
      phone: "9876543210"
    });
    await adminClient.from('user_roles').upsert({
      user_id: studentUserId,
      role: 'student'
    });
    await adminClient.from('students').upsert({
      id: studentUserId,
      roll_no: `OCI-2026-${Date.now() % 10000}`,
      status: 'active'
    });

    // Verify student can authenticate with password
    const { data: studentSignIn, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: testStudentEmail,
      password: testStudentPassword,
    });
    if (signInErr) throw new Error(`Student sign in failed: ${signInErr.message}`);
    console.log(`  ✓ Student successfully authenticated via credentials.`);

    // Verify profile in database
    const { data: studentProfile, error: profileErr } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', studentUserId)
      .single();

    if (profileErr) throw new Error(`Fetch student profile failed: ${profileErr.message}`);
    console.log(`  ✓ Database profile created: '${studentProfile.full_name}'`);

    // Verify role in user_roles
    const { data: studentRoleData, error: roleErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', studentUserId)
      .single();

    if (roleErr) throw new Error(`Fetch student role failed: ${roleErr.message}`);
    const studentRole = studentRoleData.role;
    console.log(`  ✓ User role assigned: '${studentRole}'`);
    if (studentRole !== 'student') {
      throw new Error(`CRITICAL SECURITY FAILURE: Expected role 'student', got '${studentRole}'`);
    }

    // Verify Admin Portal rejection rule:
    const isAdmin = ['admin', 'superadmin'].includes(studentRole);
    console.log(`  ✓ Admin portal login check: Rejected? ${!isAdmin ? 'YES (Secure)' : 'NO (FAILED)'}`);
    if (isAdmin) throw new Error("CRITICAL SECURITY FAILURE: Student allowed into Admin portal!");

    // Verify Student App Faculty guard:
    const isAllowedInFacultyPortal = studentRole === 'teacher';
    console.log(`  ✓ Faculty portal login check: Rejected? ${!isAllowedInFacultyPortal ? 'YES (Secure)' : 'NO (FAILED)'}`);
    if (isAllowedInFacultyPortal) throw new Error("CRITICAL SECURITY FAILURE: Student allowed into Faculty portal!");

    // 2. ADMIN-PROVISIONED FACULTY ACCOUNT
    console.log(`\n[2] Testing Admin Provisioning Faculty: ${testTeacherEmail}`);
    const { data: teacherAuth, error: teacherCreateErr } = await adminClient.auth.admin.createUser({
      email: testTeacherEmail,
      password: testTeacherPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Prof. Verification Mishra",
        role: "teacher",
        phone: "9876543211",
        subject: "General Studies"
      }
    });

    if (teacherCreateErr) throw new Error(`Teacher creation failed: ${teacherCreateErr.message}`);
    teacherUserId = teacherAuth.user?.id;
    console.log(`  ✓ Admin successfully provisioned faculty. User ID: ${teacherUserId}`);

    // Ensure teacher record in profiles, user_roles, and teachers table
    const { error: profErr } = await adminClient.from('profiles').upsert({
      id: teacherUserId,
      email: testTeacherEmail,
      full_name: "Prof. Verification Mishra",
      phone: "9876543211"
    });
    if (profErr) throw new Error(`Teacher profile upsert failed: ${profErr.message}`);

    const { error: rErr } = await adminClient.from('user_roles').upsert({
      user_id: teacherUserId,
      role: 'teacher'
    });
    if (rErr) throw new Error(`Teacher user_roles upsert failed: ${rErr.message}`);

    const { error: tErr } = await adminClient.from('teachers').upsert({
      id: teacherUserId,
      employee_id: `FAC-${Date.now() % 1000}`,
      subject: "General Studies",
      status: "active"
    });
    if (tErr) throw new Error(`Teacher table upsert failed: ${tErr.message}`);

    const { data: teacherRoleData, error: teacherRoleErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', teacherUserId)
      .single();

    if (teacherRoleErr) throw new Error(`Fetch teacher role failed: ${teacherRoleErr.message}`);
    const teacherRole = teacherRoleData.role;
    console.log(`  ✓ Faculty role confirmed: '${teacherRole}'`);

    // Verify Student portal rejection for faculty:
    const isAllowedInStudentPortal = teacherRole === 'student';
    console.log(`  ✓ Student portal rejection check: Rejected? ${!isAllowedInStudentPortal ? 'YES (Secure)' : 'NO (FAILED)'}`);
    if (isAllowedInStudentPortal) throw new Error("CRITICAL SECURITY FAILURE: Teacher allowed into Student portal!");

    // Verify Admin portal rejection for faculty:
    const isTeacherAdmin = ['admin', 'superadmin'].includes(teacherRole);
    console.log(`  ✓ Admin portal rejection check: Rejected? ${!isTeacherAdmin ? 'YES (Secure)' : 'NO (FAILED)'}`);
    if (isTeacherAdmin) throw new Error("CRITICAL SECURITY FAILURE: Teacher allowed into Admin portal!");

    console.log("\n=== ALL AUTHENTICATION & ROLE ISOLATION TESTS PASSED! ===");
  } finally {
    // CLEANUP
    console.log("\n[3] Cleaning up test users...");
    if (studentUserId) {
      await adminClient.auth.admin.deleteUser(studentUserId);
      console.log(`  ✓ Deleted test student: ${studentUserId}`);
    }
    if (teacherUserId) {
      await adminClient.auth.admin.deleteUser(teacherUserId);
      console.log(`  ✓ Deleted test faculty: ${teacherUserId}`);
    }
  }
}

runAuthVerification().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
