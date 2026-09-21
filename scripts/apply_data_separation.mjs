import './env_loader.mjs';
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

const DEMO_QUESTIONS = [
  'dc000000-0000-0000-0000-000000000001',
  'dc000000-0000-0000-0000-000000000002',
  'dc000000-0000-0000-0000-000000000003',
];

const DEMO_EXAMS = [
  'e0000000-0000-0000-0000-000000000001',
];

const DEMO_BATCHES = [
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
];

const DEMO_SUBJECTS = [
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000004',
];

const DEMO_COURSES = [
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
];

const DEMO_ANNOUNCEMENTS = [
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
];

async function main() {
  console.log("=== EXECUTING OPERATIONAL SEED PURGE & DATA DOMAIN SEPARATION ===");

  // 1. Purge Questions
  const { error: qErr } = await adminClient.from('questions').delete().in('id', DEMO_QUESTIONS);
  if (qErr) console.warn("Notice deleting questions:", qErr.message);
  else console.log("✓ Purged demo questions");

  // 2. Purge Exams
  const { error: exErr } = await adminClient.from('exams').delete().in('id', DEMO_EXAMS);
  if (exErr) console.warn("Notice deleting exams:", exErr.message);
  else console.log("✓ Purged demo exams");

  // 3. Purge Batches
  const { error: bErr } = await adminClient.from('batches').delete().in('id', DEMO_BATCHES);
  if (bErr) console.warn("Notice deleting batches:", bErr.message);
  else console.log("✓ Purged demo batches");

  // 4. Purge Subjects
  const { error: sErr } = await adminClient.from('subjects').delete().in('id', DEMO_SUBJECTS);
  if (sErr) console.warn("Notice deleting subjects:", sErr.message);
  else console.log("✓ Purged demo subjects");

  // 5. Purge Courses
  const { error: cErr } = await adminClient.from('courses').delete().in('id', DEMO_COURSES);
  if (cErr) console.warn("Notice deleting courses:", cErr.message);
  else console.log("✓ Purged demo courses");

  // 6. Purge Demo Announcements
  const { error: aErr } = await adminClient.from('announcements').delete().in('id', DEMO_ANNOUNCEMENTS);
  if (aErr) console.warn("Notice deleting announcements:", aErr.message);
  else console.log("✓ Purged demo announcements");

  // 7. Verify Public Website CMS Content is Preserved
  const { data: webFaculty } = await adminClient.from('website_faculty').select('id, name');
  console.log(`✓ Public Website Faculty CMS preserved: ${webFaculty?.length || 0} profile(s)`);

  const { data: webTestimonials } = await adminClient.from('website_testimonials').select('id, student_name');
  console.log(`✓ Public Website Testimonials preserved: ${webTestimonials?.length || 0} testimonial(s)`);

  const { data: webStories } = await adminClient.from('website_success_stories').select('id, student_name');
  console.log(`✓ Public Website Success Stories preserved: ${webStories?.length || 0} story/stories`);

  const { data: appVersions } = await adminClient.from('app_versions').select('id, version_name, is_active');
  console.log(`✓ App Release Distribution preserved: ${appVersions?.length || 0} release(s)`);

  // 8. Verify Operational Academic Tables are Clean
  const { data: courses } = await adminClient.from('courses').select('id');
  console.log(`✓ Operational Courses count: ${courses?.length || 0} (Expected: 0 on fresh production)`);

  const { data: batches } = await adminClient.from('batches').select('id');
  console.log(`✓ Operational Batches count: ${batches?.length || 0} (Expected: 0 on fresh production)`);

  const { data: exams } = await adminClient.from('exams').select('id');
  console.log(`✓ Operational Exams count: ${exams?.length || 0} (Expected: 0 on fresh production)`);

  const { data: announcements } = await adminClient.from('announcements').select('id');
  console.log(`✓ Operational Announcements count: ${announcements?.length || 0} (Expected: 0 on fresh production)`);

  console.log("=== DATA SEPARATION & OPERATIONAL PURGE COMPLETE! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
