import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { checkoutOrderSchema } from '@/lib/security/validation';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_PRODUCTS, INITIAL_SPEND_TIERS, INITIAL_COUPONS } from '@/lib/supabase/mock-db';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`checkout:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Checkout rate limit exceeded. Please wait ${rate.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || 'Invalid checkout payload.';
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }

    const { items, couponCode, paymentMethod, isGift, giftMessage, shippingAddress } = parsed.data;

    // 1. RECALCULATE ALL PRICES ON SERVER (Never trust client prices)
    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    if (isRealSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const productIds = items.map((i) => i.productId);

      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('id, name, price, discount_percent, stock_quantity, is_active')
        .in('id', productIds);

      if (dbError || !dbProducts || dbProducts.length === 0) {
        return NextResponse.json({ success: false, error: 'One or more items in your cart are no longer available.' }, { status: 400 });
      }

      for (const item of items) {
        const prod = dbProducts.find((p) => p.id === item.productId && p.is_active);
        if (!prod) {
          return NextResponse.json({ success: false, error: `Product unavailable: ${item.productId}` }, { status: 400 });
        }

        const discountedUnitPrice = prod.discount_percent > 0
          ? prod.price * (1 - prod.discount_percent / 100)
          : prod.price;

        const lineTotal = discountedUnitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        verifiedOrderItems.push({
          productId: prod.id,
          name: prod.name,
          unitPrice: discountedUnitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }
    } else {
      for (const item of items) {
        const prod = INITIAL_PRODUCTS.find((p) => p.id === item.productId && p.is_active);
        if (!prod) {
          return NextResponse.json({ success: false, error: `Product unavailable: ${item.productId}` }, { status: 400 });
        }

        const discountedUnitPrice = prod.discount_percent > 0
          ? prod.price * (1 - prod.discount_percent / 100)
          : prod.price;

        const lineTotal = discountedUnitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        verifiedOrderItems.push({
          productId: prod.id,
          name: prod.name,
          unitPrice: discountedUnitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }
    }

    // 2. RECALCULATE SPEND TIER DISCOUNT ON SERVER
    const sortedTiers = [...INITIAL_SPEND_TIERS].sort((a, b) => b.min_spend - a.min_spend);
    const qualifyingTier = sortedTiers.find((t) => calculatedSubtotal >= t.min_spend);
    const tierDiscountAmount = qualifyingTier ? (calculatedSubtotal * qualifyingTier.discount_percent) / 100 : 0;

    // 3. RECALCULATE COUPON DISCOUNT ON SERVER
    let couponDiscountAmount = 0;
    if (couponCode) {
      const cleanCoupon = couponCode.toUpperCase().trim();
      const validCoupon = INITIAL_COUPONS.find((c) => c.code === cleanCoupon && c.active);

      if (validCoupon && calculatedSubtotal >= validCoupon.min_order_value) {
        if (validCoupon.discount_amount) {
          couponDiscountAmount = validCoupon.discount_amount;
        } else if (validCoupon.discount_percent) {
          couponDiscountAmount = (calculatedSubtotal * validCoupon.discount_percent) / 100;
        }
      }
    }

    const totalDiscount = tierDiscountAmount + couponDiscountAmount;
    const finalServerTotal = Math.max(0, calculatedSubtotal - totalDiscount);
    const orderId = 'ord-' + Date.now();

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        subtotal: calculatedSubtotal,
        discountAmount: totalDiscount,
        total: finalServerTotal,
        paymentMethod,
        isGift: Boolean(isGift),
        giftMessage: giftMessage || null,
        shippingAddress: shippingAddress || null,
        items: verifiedOrderItems,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process order calculation. Please try again.' },
      { status: 500 }
    );
  }
}
