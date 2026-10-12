import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { otpSendSchema } from '@/lib/security/validation';
import { createOtp } from '@/lib/security/otp';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`otp-send:${ip}`, { limit: 3, windowMs: 5 * 60 * 1000 });

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
    // Generate code on server (never leak in production response)
    createOtp(phone);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully. Valid for 5 minutes.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code. Please try again later.' },
      { status: 500 }
    );
  }
}
