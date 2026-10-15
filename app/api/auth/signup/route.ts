import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { signupSchema } from '@/lib/security/validation';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`signup:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many signup attempts. Please try again in ${rate.retryAfterSec} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input data.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { email, password, fullName, phone } = parsed.data;

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const origin = new URL(request.url).origin;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || email.split('@')[0],
            phone: phone?.trim() || null,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        let friendly = error.message;
        if (
          error.message.includes('User already registered') ||
          error.message.includes('already exists')
        ) {
          friendly = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
          friendly = 'Password is too weak. Please use at least 6 characters.';
        }
        return NextResponse.json({ success: false, error: friendly }, { status: 400 });
      }

      const confirmationRequired = data.user && !data.session;

      return NextResponse.json({
        success: true,
        message: confirmationRequired
          ? 'Account created. Please check your inbox for the confirmation link.'
          : 'Account created successfully.',
        confirmationSent: confirmationRequired,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          fullName: data.user?.user_metadata?.full_name,
        },
      });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration service is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.',
        },
        { status: 503 }
      );
    }

    // Local development mock
    const mockId = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
    return NextResponse.json({
      success: true,
      message: 'Account created successfully (development mock).',
      user: {
        id: mockId,
        email,
        full_name: fullName,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during account creation.' },
      { status: 500 }
    );
  }
}
