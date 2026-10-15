import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { loginSchema } from '@/lib/security/validation';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Please try again in ${rate.retryAfterSec} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        let friendly = 'Invalid email or password.';
        if (error?.message?.includes('Email not confirmed')) {
          friendly = 'Email not confirmed yet. Please verify your email before logging in.';
        }
        return NextResponse.json(
          { success: false, error: friendly },
          { status: 401 }
        );
      }

      // Query profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: profile?.full_name || data.user.user_metadata?.full_name,
          role: profile?.role || 'customer',
        },
      });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication service is not configured. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.',
        },
        { status: 503 }
      );
    }

    // Local development mock fallback
    const mockId = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
    return NextResponse.json({
      success: true,
      user: {
        id: mockId,
        email,
        fullName: email.split('@')[0],
        role: email === 'admin@forevere.com' ? 'admin' : 'customer',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
