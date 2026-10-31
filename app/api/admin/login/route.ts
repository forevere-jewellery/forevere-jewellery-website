import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { loginSchema } from '@/lib/security/validation';
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }
    if (!isRealSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service is not configured.' }, { status: 503 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
    });
    if (error || !data.user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    let role = profile?.role;
    if (!role) {
      const { data: legacyProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      role = legacyProfile?.role;
    }

    if (role !== 'admin') {
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: 'Access denied: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: { id: data.user.id, email: data.user.email, role: 'admin' },
    });
    response.cookies.delete('fj_admin_token');
    response.cookies.delete('fj_role');
    response.cookies.delete('fj_user_id');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
