import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AdminAuthResult {
  authorized: boolean;
  userId?: string;
  email?: string;
  response?: NextResponse;
}

/**
 * Server-side authoritative security verification for Admin API routes.
 * Verifies that the incoming request has a valid Supabase JWT and belongs to an Administrator.
 * Strictly prevents unauthenticated access or role spoofing.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  // 1. Support internal server-to-server key if explicitly configured
  const internalKey = req.headers.get('x-admin-key');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (internalKey && serviceRoleKey && internalKey === serviceRoleKey) {
    return {
      authorized: true,
      email: 'service-role@oci.system',
    };
  }

  // 2. Extract Bearer token from Authorization header
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Missing or invalid Authorization header. Valid administrator bearer token required.',
        },
        { status: 401 }
      ),
    };
  }

  // 2b. Direct service role authorization
  if (serviceRoleKey && token === serviceRoleKey) {
    return {
      authorized: true,
      email: 'service-role@oci.system',
    };
  }

  try {
    // 3. Validate token authoritatively with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or expired administrator session token.' },
          { status: 401 }
        ),
      };
    }

    // 4. Verify Administrator role from user_roles (database source of truth)
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    let role = roleRow?.role?.toLowerCase();

    // Fallback check on profiles table if migration transition
    if (!role) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      role = profile?.role?.toLowerCase();
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Account does not hold verified administrator privileges.' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      userId: user.id,
      email: user.email,
    };
  } catch (err: any) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: err.message || 'Server authorization check failed.' },
        { status: 500 }
      ),
    };
  }
}
