import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';

const SECRET_SEED = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_SESSION_SECRET || 'forevere_secure_internal_admin_key_2026';

/**
 * Creates a signed admin token with timestamp
 */
export function signAdminToken(adminId: string = 'admin'): string {
  const timestamp = Date.now();
  const payload = `${adminId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_SEED).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

/**
 * Verifies the signed admin token and checks expiration (7 days)
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const [adminId, timeStr, receivedHmac] = parts;
    const timestamp = parseInt(timeStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration: 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = crypto.createHmac('sha256', SECRET_SEED).update(`${adminId}:${timeStr}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

/**
 * Validates admin authorization for an incoming request.
 * Checks:
 * 1. Secure admin session cookie
 * 2. Supabase server session & database role (if Supabase configured)
 */
export async function verifyAdminRequest(request: Request | NextRequest): Promise<{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}> {
  // 1. Check signed admin token from cookie
  let adminCookieToken: string | undefined;
  if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
    adminCookieToken = (request as NextRequest).cookies.get('fj_admin_token')?.value;
  } else {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/fj_admin_token=([^;]+)/);
    if (match) adminCookieToken = match[1];
  }

  if (adminCookieToken && verifyAdminToken(adminCookieToken)) {
    return { isAdmin: true, userId: 'admin' };
  }

  // 2. Check Supabase server-side session & role
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { isAdmin: false, error: 'Unauthorized: No active user session.' };
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        return { isAdmin: true, userId: user.id };
      }

      return { isAdmin: false, error: 'Forbidden: Insufficient privileges.' };
    } catch {
      return { isAdmin: false, error: 'Internal authorization error.' };
    }
  }

  return { isAdmin: false, error: 'Access denied: Administrator privileges required.' };
}
