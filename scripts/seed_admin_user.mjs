import './env_loader.mjs';
import { createClient } from '../admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('Please configure them in admin/.env.local or pass them directly in the environment.\n');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@oci.edu.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  console.log(`Checking if ${adminEmail} exists...`);
  const { data: userList, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr);
    process.exit(1);
  }

  let adminUser = userList.users.find(u => u.email === adminEmail);

  if (!adminUser) {
    console.log(`Creating user ${adminEmail}...`);
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'OCI Master Administrator',
        role: 'admin',
      },
    });

    if (createErr) {
      console.error('Failed to create admin user:', createErr);
      process.exit(1);
    }
    adminUser = created.user;
    console.log(`Created user with ID: ${adminUser.id}`);
  } else {
    console.log(`Admin user already exists with ID: ${adminUser.id}`);
    // Update password to ensure it matches
    await adminClient.auth.admin.updateUserById(adminUser.id, {
      password: adminPassword,
      email_confirm: true,
    });
    console.log(`Updated password for ${adminEmail} to ${adminPassword}`);
  }

  // Ensure profile
  await adminClient.from('profiles').upsert({
    id: adminUser.id,
    email: adminEmail,
    full_name: 'OCI Master Administrator',
  });

  // Ensure user_roles has 'admin'
  const { data: existingRole } = await adminClient
    .from('user_roles')
    .select('id')
    .eq('user_id', adminUser.id)
    .maybeSingle();

  if (existingRole) {
    await adminClient.from('user_roles').update({ role: 'admin' }).eq('user_id', adminUser.id);
  } else {
    await adminClient.from('user_roles').insert({ user_id: adminUser.id, role: 'admin' });
  }

  console.log('\n=== ADMIN CREDENTIALS READY ===');
  console.log('Email / ID: ' + adminEmail);
  console.log('Password  : ' + adminPassword);
}

seedAdmin().catch(console.error);
