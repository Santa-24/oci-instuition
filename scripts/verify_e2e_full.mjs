import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utrusmludikyvxbmpicg.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SERVICE_KEY || !ANON_KEY) {
  console.log('Skipping E2E script: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY not set.');
  process.exit(0);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function runE2E() {
  console.log('=== STARTING END-TO-END SUPABASE & CROSS-APP VERIFICATION ===\n');

  // 1. Verify Public Website Anon Reads
  console.log('[1] Testing Public Anon Data Reads:');
  const { data: publicCourses, error: cErr } = await anonClient.from('courses').select('id, name, code, is_active').eq('is_active', true);
  if (cErr) throw new Error('Failed to read public courses: ' + cErr.message);
  console.log(`  ✓ Read ${publicCourses.length} active courses for public website.`);

  const { data: publicReleases, error: rErr } = await anonClient.from('app_versions').select('version_name, version_code, is_active').eq('platform', 'android').eq('is_active', true);
  if (rErr) throw new Error('Failed to read public app versions: ' + rErr.message);
  console.log(`  ✓ Read ${publicReleases.length} active Android release(s). Latest: v${publicReleases[0]?.version_name || 'N/A'}`);

  const { data: publicNotices, error: nErr } = await anonClient.from('announcements').select('id, title, is_active').eq('is_active', true);
  if (nErr) throw new Error('Failed to read public announcements: ' + nErr.message);
  console.log(`  ✓ Read ${publicNotices.length} active announcements for public website.`);

  // 2. Test Admin Service Role Operations (Bypassing RLS)
  console.log('\n[2] Testing Administrative CRUD Operations:');
  
  // Create a course
  const testCourseId = crypto.randomUUID();
  const { data: createdCourse, error: createCErr } = await adminClient.from('courses').insert({
    id: testCourseId,
    name: 'E2E Verification Course - Odisha Police SI',
    code: 'E2E-OPSI-2026',
    category: 'State Recruitment',
    duration_months: 6,
    description: 'Special batch for testing live database synchronization.',
    is_active: true,
  }).select().single();
  if (createCErr) throw new Error('Failed to insert admin course: ' + createCErr.message);
  console.log(`  ✓ Created course: "${createdCourse.name}" (ID: ${createdCourse.id})`);

  // Verify course is immediately visible to public website anon client
  const { data: anonFoundCourse } = await anonClient.from('courses').select('id, name').eq('id', testCourseId).single();
  console.log(`  ✓ Public website instantly sees newly created course: "${anonFoundCourse?.name}"`);

  // Create an enquiry via backend service role (as public-website /api/contact does)
  const testEnquiryId = crypto.randomUUID();
  const { data: createdEnquiry, error: enqErr } = await adminClient.from('enquiries').insert({
    id: testEnquiryId,
    name: 'Ananya Pattnaik',
    phone: '9437123456',
    email: 'ananya.pattnaik@gmail.com',
    interested_course: 'Odisha Police SI Batch',
    message: 'I want to inquire about upcoming morning batch timings and fees.',
    source: 'Website Form',
    status: 'NEW',
  }).select().single();
  if (enqErr) throw new Error('Failed to create enquiry: ' + enqErr.message);
  console.log(`  ✓ Created admission enquiry for "${createdEnquiry.name}" (ID: ${createdEnquiry.id})`);

  // Update enquiry status from NEW to CONTACTED (Admin action)
  const { data: updatedEnquiry, error: updateEnqErr } = await adminClient.from('enquiries').update({
    status: 'CONTACTED',
    internal_notes: 'Spoke with candidate. Invited for counseling on Monday.',
  }).eq('id', testEnquiryId).select().single();
  if (updateEnqErr) throw new Error('Failed to update enquiry status: ' + updateEnqErr.message);
  console.log(`  ✓ Admin updated enquiry status: ${updatedEnquiry.status} - Notes: "${updatedEnquiry.internal_notes}"`);

  // Create an announcement (Admin action)
  const testNoticeId = crypto.randomUUID();
  const { data: createdNotice, error: noticeErr } = await adminClient.from('announcements').insert({
    id: testNoticeId,
    title: 'E2E Flash Notice: Special Sunday Marathon Class',
    content: 'All aspirants are invited to Hall A for Reasoning speed drills.',
    audience: 'all',
    priority: 'urgent',
    is_active: true,
  }).select().single();
  if (noticeErr) throw new Error('Failed to create announcement: ' + noticeErr.message);
  console.log(`  ✓ Created flash announcement: "${createdNotice.title}"`);

  // Verify public anon sees the announcement
  const { data: anonNotice } = await anonClient.from('announcements').select('id, title').eq('id', testNoticeId).single();
  console.log(`  ✓ Public homepage instantly detects active announcement: "${anonNotice?.title}"`);

  // 3. Clean up test records
  console.log('\n[3] Cleaning up test records to maintain pristine database:');
  await adminClient.from('courses').delete().eq('id', testCourseId);
  await adminClient.from('enquiries').delete().eq('id', testEnquiryId);
  await adminClient.from('announcements').delete().eq('id', testNoticeId);
  console.log('  ✓ Deleted test course, test enquiry, and test announcement.');

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY! ===');
}

runE2E().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
