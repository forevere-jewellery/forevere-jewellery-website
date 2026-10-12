import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { couponValidateSchema } from '@/lib/security/validation';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_COUPONS } from '@/lib/supabase/mock-db';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`coupon-validate:${ip}`, { limit: 10, windowMs: 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many coupon validation attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid coupon format.' }, { status: 400 });
    }

    const { code, orderAmount = 0 } = parsed.data;
    const cleanCode = code.toUpperCase().trim();

    let coupon: {
      code: string;
      discount_percent: number | null;
      discount_amount: number | null;
      min_order_value: number;
      active: boolean;
    } | null = null;

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from('coupons')
        .select('code, discount_percent, discount_amount, min_order_value, active')
        .eq('code', cleanCode)
        .eq('active', true)
        .single();

      coupon = data;
    } else {
      const found = INITIAL_COUPONS.find((c) => c.code === cleanCode && c.active);
      if (found) {
        coupon = {
          code: found.code,
          discount_percent: found.discount_percent,
          discount_amount: found.discount_amount,
          min_order_value: found.min_order_value,
          active: found.active,
        };
      }
    }

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired promotional code.' },
        { status: 404 }
      );
    }

    if (orderAmount < coupon.min_order_value) {
      return NextResponse.json(
        {
          success: false,
          error: `This coupon requires a minimum cart value of ₹${coupon.min_order_value.toLocaleString('en-IN')}.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmount: coupon.discount_amount,
        minOrderValue: coupon.min_order_value,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to validate coupon at this time.' },
      { status: 500 }
    );
  }
}
