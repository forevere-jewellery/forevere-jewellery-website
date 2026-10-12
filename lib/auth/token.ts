const SECRET_SEED =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'forevere_secure_internal_admin_key_2026';

const encoder = new TextEncoder();

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

async function hmacSha256Hex(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_SEED),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Constant-time string comparison
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates a signed admin token with timestamp
 */
export async function signAdminToken(adminId: string = 'admin'): Promise<string> {
  const timestamp = Date.now();
  const payload = `${adminId}:${timestamp}`;
  const hmac = await hmacSha256Hex(payload);
  return toBase64Url(`${payload}:${hmac}`);
}

/**
 * Verifies the signed admin token and checks expiration (7 days)
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = fromBase64Url(token);
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const [adminId, timeStr, receivedHmac] = parts;
    const timestamp = parseInt(timeStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration: 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = await hmacSha256Hex(`${adminId}:${timeStr}`);
    return safeEqual(receivedHmac, expectedHmac);
  } catch {
    return false;
  }
}