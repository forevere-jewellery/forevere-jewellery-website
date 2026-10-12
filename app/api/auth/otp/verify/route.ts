import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { otpVerifySchema } from '@/lib/security/validation';
import { verifyOtp } from '@/lib/security/otp';

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
    const verificationResult = verifyOtp(phone, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully.',
      user: {
        id: 'u-' + Math.random().toString(36).substring(2, 11),
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
