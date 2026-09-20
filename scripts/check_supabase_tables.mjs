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

const ALL_EXPECTED_TABLES = [
  // Domain 1: Public Website CMS
  { name: 'website_content', domain: 'Public Website CMS' },
  { name: 'website_faculty', domain: 'Public Website CMS' },
  { name: 'website_testimonials', domain: 'Public Website CMS' },
  { name: 'website_success_stories', domain: 'Public Website CMS' },
  { name: 'website_faqs', domain: 'Public Website CMS' },
  { name: 'website_gallery', domain: 'Public Website CMS' },

  // Domain 2: Academic Operational
  { name: 'profiles', domain: 'Identity & Profiles' },
  { name: 'user_roles', domain: 'Identity & Authorization' },
  { name: 'students', domain: 'Academic Operational' },
  { name: 'teachers', domain: 'Academic Operational' },
  { name: 'courses', domain: 'Academic Operational' },
  { name: 'subjects', domain: 'Academic Operational' },
  { name: 'batches', domain: 'Academic Operational' },
  { name: 'batch_students', domain: 'Academic Operational' },
  { name: 'live_classes', domain: 'Academic Operational' },
  { name: 'study_materials', domain: 'Academic Operational' },
  { name: 'recorded_classes', domain: 'Academic Operational' },
  { name: 'assignments', domain: 'Academic Operational' },
  { name: 'assignment_submissions', domain: 'Academic Operational' },
  { name: 'questions', domain: 'Academic Operational' },
  { name: 'exams', domain: 'Academic Operational' },
  { name: 'exam_questions', domain: 'Academic Operational' },
  { name: 'exam_results', domain: 'Academic Operational' },
  { name: 'attendance', domain: 'Academic Operational' },

  // Domain 3: Communication & Leads
  { name: 'enquiries', domain: 'Communication / Leads' },
  { name: 'announcements', domain: 'Communication / Bulletins' },
  { name: 'notifications', domain: 'Communication / Alerts' },
  { name: 'notification_tokens', domain: 'Communication / Push' },
  { name: 'audit_logs', domain: 'Security & Audit' },

  // Domain 4: Release Distribution
  { name: 'app_versions', domain: 'Release Distribution' },
];

async function checkTables() {
  console.log("=== COMPREHENSIVE SUPABASE TABLE STATUS AUDIT ===\n");
  const results = [];

  for (const table of ALL_EXPECTED_TABLES) {
    try {
      const { count, error } = await adminClient
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({
          name: table.name,
          domain: table.domain,
          status: 'ERROR',
          error: error.message,
          count: null,
        });
      } else {
        results.push({
          name: table.name,
          domain: table.domain,
          status: 'EXISTS',
          count: count,
        });
      }
    } catch (e) {
      results.push({
        name: table.name,
        domain: table.domain,
        status: 'EXCEPTION',
        error: e.message,
        count: null,
      });
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

checkTables();
