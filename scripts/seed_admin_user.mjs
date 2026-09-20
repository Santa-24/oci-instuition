import { createClient } from '../admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://utrusmludikyvxbmpicg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cnVzbWx1ZGlreXZ4Ym1waWNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgxNTk0MiwiZXhwIjoyMTA1MzkxOTQyfQ.SS4mdzmT_3DO4Lz0gVYPRfT6apJEfMVpPpHYVOo3iLc';

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  const adminEmail = 'admin@oci.edu.in';
  const adminPassword = 'Admin@123';

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
