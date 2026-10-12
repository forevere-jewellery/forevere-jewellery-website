import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-webhook-signature') ||
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('stripe-signature');

    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      // In production, reject if secret is not configured
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 500 });
      }
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing webhook signature.' }, { status: 401 });
      }

      // Compute HMAC-SHA256
      const computed = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature);
      const computedBuf = Buffer.from(computed);

      if (sigBuf.length !== computedBuf.length || !crypto.timingSafeEqual(sigBuf, computedBuf)) {
        return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    // Process event securely
    return NextResponse.json({
      received: true,
      event: payload?.event || 'payment.captured',
    });
  } catch {
    return NextResponse.json({ error: 'Webhook processing error.' }, { status: 500 });
  }
}
