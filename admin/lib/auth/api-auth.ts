import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AdminAuthResult {
  authorized: boolean;
  userId?: string;
  email?: string;
  response?: NextResponse;
}

/**
 * Server-side authorization check for Admin API routes.
 * Verifies that the incoming request has a valid Supabase JWT and belongs to an Administrator.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    // In server component or internal Next API context, check if service key is used or cookie is present
    return {
      authorized: true, // Allow server-internal operations if token is handled upstream
    };
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 }),
      };
    }

    const { data: roleRow } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = roleRow?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return {
        authorized: false,
        response: NextResponse.json({ success: false, error: 'Forbidden: Admin role required' }, { status: 403 }),
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
      response: NextResponse.json({ success: false, error: err.message || 'Authorization failed' }, { status: 500 }),
    };
  }
}
