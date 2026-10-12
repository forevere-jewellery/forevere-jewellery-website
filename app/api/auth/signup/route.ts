import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { signupSchema } from '@/lib/security/validation';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`signup:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 });

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            phone: phone || null,
          },
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Unable to complete registration. Please try again.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for confirmation.',
        user: { id: data.user?.id, email: data.user?.email },
      });
    }

    // Mock fallback response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: 'u-' + Math.random().toString(36).substring(2, 11),
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
