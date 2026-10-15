import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { otpSendSchema } from '@/lib/security/validation';
import { createOtp } from '@/lib/security/otp';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`otp-send:${ip}`, { limit: 5, windowMs: 5 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Please try again in ${rate.retryAfterSec} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = otpSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      const digits = formattedPhone.replace(/\D/g, '');
      formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    }

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

      if (error) {
        const isProviderMissing = error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('disabled');
        return NextResponse.json(
          {
            success: false,
            error: isProviderMissing
              ? 'Phone authentication is not enabled in your Supabase dashboard. Please enable Twilio or MessageBird in Supabase Auth > Providers > Phone.'
              : error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code dispatched to your mobile device.',
      });
    }

    // Local development fallback
    createOtp(phone);
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully (development mock: 123456).',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code. Please try again later.' },
      { status: 500 }
    );
  }
}
