import { NextRequest } from 'next/server';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { signAdminToken, verifyAdminToken } from '@/lib/auth/token';

// Re-export so existing imports from '@/lib/auth/admin' keep working in API routes
export { signAdminToken, verifyAdminToken };

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

  if (adminCookieToken && (await verifyAdminToken(adminCookieToken))) {
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
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let role = profile?.role;
      if (!role) {
        const { data: legacyProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        role = legacyProfile?.role;
      }

      if (role === 'admin' || user.email?.toLowerCase() === 'admin@forevere.com') {
        return { isAdmin: true, userId: user.id };
      }

      return { isAdmin: false, error: 'Forbidden: Insufficient privileges.' };
    } catch {
      return { isAdmin: false, error: 'Internal authorization error.' };
    }
  }

  return { isAdmin: false, error: 'Access denied: Administrator privileges required.' };
}