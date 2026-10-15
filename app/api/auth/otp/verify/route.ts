import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { otpVerifySchema } from '@/lib/security/validation';
import { verifyOtp } from '@/lib/security/otp';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`otp-verify:${ip}`, { limit: 5, windowMs: 5 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many verification attempts. Please wait ${rate.retryAfterSec} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = otpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code format.' },
        { status: 400 }
      );
    }

    const { phone, otp } = parsed.data;

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      const digits = formattedPhone.replace(/\D/g, '');
      formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    }

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms',
      });

      if (error || !data.user) {
        return NextResponse.json(
          { success: false, error: error?.message || 'Invalid verification code.' },
          { status: 400 }
        );
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully.',
        user: {
          id: data.user.id,
          phone: formattedPhone,
          fullName: profile?.full_name || null,
        },
      });
    }

    // Local development fallback
    const verificationResult = verifyOtp(phone, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid verification code.' },
        { status: 400 }
      );
    }

    const mockId = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully.',
      user: {
        id: mockId,
        phone,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during verification.' },
      { status: 500 }
    );
  }
}
