'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Order } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import {
  CheckCircle2,
  Sparkles,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Truck,
  Gift
} from 'lucide-react';

interface OrderConfirmationViewProps {
  orderId: string;
}

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#D4AF37', '#111111', '#EADFC9']
      });
    } catch {
      // ignore
    }

    mockDB.loadFromLocalStorage();
    const found = mockDB.orders.find((o) => o.id === orderId);
    if (found) {
      setOrder(found);
    }
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10 text-[#111111]">
      
      {/* Celebration Header */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-xs font-semibold uppercase tracking-widest font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Authorized &bull; Order Confirmed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif tracking-tight">
          Thank You For Your Order
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 font-sans max-w-md mx-auto">
          We are preparing your handcrafted fine jewelry. A confirmation receipt has been generated.
        </p>

        <div className="pt-2 font-mono text-xs bg-[#FDFBF7] border border-[#EADFC9] px-4 py-2 rounded-xl inline-block text-gray-700">
          Order Reference: <strong className="text-[#111111]">{orderId}</strong>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      {order && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          
          {/* Purchased Items (2 cols) */}
          <div className="md:col-span-2 bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#F4EAD3] pb-4">
              <Package className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-serif text-lg font-semibold text-[#111111]">Items in this Package</h3>
            </div>

            <div className="divide-y divide-[#F4EAD3] space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-serif font-semibold text-sm text-[#111111]">{item.product_name_snapshot}</p>
                    <p className="text-gray-400 text-[11px]">Qty: {item.quantity} &bull; ₹{item.price_snapshot.toLocaleString('en-IN')} each</p>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#111111]">
                    ₹{(item.price_snapshot * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {order.is_gift && order.gift_message && (
              <div className="p-4 bg-[#F8F3E6] border border-[#EADFC9] rounded-2xl flex items-start gap-3">
                <Gift className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-serif font-bold text-[#111111] block">Gift Packaging &amp; Message</span>
                  <p className="text-gray-600 italic leading-relaxed">&ldquo;{order.gift_message}&rdquo;</p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Billing Summary (1 col) */}
          <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F4EAD3] pb-4">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif font-semibold text-sm text-[#111111]">Delivery Destination</h3>
              </div>

              {order.shipping_address && (
                <div className="text-gray-600 space-y-1 text-[11px] leading-relaxed">
                  <p className="font-serif font-bold text-[#111111] text-xs">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.line1}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
                  <p className="text-gray-400 pt-1">Phone: {order.shipping_address.phone}</p>
                </div>
              )}

              <div className="border-t border-[#F4EAD3] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-[#111111]">{order.payment_method}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment Status:</span>
                  <span className="text-emerald-700 font-semibold uppercase text-[10px]">PAID</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-base text-[#111111] pt-2 border-t border-[#F4EAD3]">
                  <span>Total Paid:</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/shop"
                className="w-full py-3 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow text-center block transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
