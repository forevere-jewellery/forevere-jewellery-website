import crypto from 'crypto';

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();

// Cleanup expired OTPs every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [phone, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(phone);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Creates and stores a 6-digit OTP code valid for 5 minutes.
 */
export function createOtp(phone: string): string {
  const code = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');

  otpStore.set(phone, {
    codeHash: hash,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
    attempts: 0,
  });

  return code;
}

/**
 * Verifies OTP code against stored record with attempt rate limits.
 */
export function verifyOtp(phone: string, inputCode: string): { success: boolean; error?: string } {
  const record = otpStore.get(phone);

  if (!record) {
    return { success: false, error: 'Verification code expired or not requested. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
  }

  record.attempts += 1;

  const inputHash = crypto.createHash('sha256').update(inputCode).digest('hex');
  if (record.codeHash !== inputHash) {
    const remaining = 3 - record.attempts;
    return {
      success: false,
      error: remaining > 0 ? `Incorrect verification code. ${remaining} attempt(s) remaining.` : 'Too many incorrect attempts. Code invalidated.',
    };
  }

  // Successfully verified - clear entry
  otpStore.delete(phone);
  return { success: true };
}
