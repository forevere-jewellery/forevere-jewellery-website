import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { loginSchema } from '@/lib/security/validation';
import { signAdminToken } from '@/lib/auth/admin';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Please try again in ${rate.retryAfterSec} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    let isAuthenticated = false;
    let adminUserId = 'admin-user-id';

    // 1. Check Supabase Auth if real Supabase is configured
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'admin') {
            isAuthenticated = true;
            adminUserId = data.user.id;
          }
        }
      } catch {
        // Fall back to env verification
      }
    }

    // 2. Check Server-Side Environment Variables (read server-side only, never NEXT_PUBLIC_)
    if (!isAuthenticated) {
      const serverAdminEmail = process.env.ADMIN_EMAIL;
      const serverAdminPassword = process.env.ADMIN_PASSWORD;

      if (serverAdminEmail && serverAdminPassword) {
        const emailMatches = email.toLowerCase().trim() === serverAdminEmail.toLowerCase().trim();
        const passBuf = Buffer.from(password);
        const expectedBuf = Buffer.from(serverAdminPassword);
        const passMatches = passBuf.length === expectedBuf.length && crypto.timingSafeEqual(passBuf, expectedBuf);

        if (emailMatches && passMatches) {
          isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Create signed token
    const token = signAdminToken(adminUserId);
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
    });

    // Set secure HttpOnly cookie for admin verification
    response.cookies.set('fj_admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Also set standard role cookie for UI state
    response.cookies.set('fj_role', 'admin', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
