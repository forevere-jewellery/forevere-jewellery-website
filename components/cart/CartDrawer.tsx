'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import { useAuth } from '@/components/auth/AuthContext';
import { mockDB } from '@/lib/supabase/mock-db';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles
} from 'lucide-react';

export function CartDrawer() {
  const router = useRouter();
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { user, openAuthModal } = useAuth();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    if (!user) {
      openAuthModal('login');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] border-l border-[#EADFC9] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EADFC9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-serif text-lg font-semibold text-[#111111]">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length > 0 ? (
              <div className="divide-y divide-[#F4EAD3] space-y-6">
                {cartItems.map((item) => {
                  const product = item.product || mockDB.products.find((p) => p.id === item.product_id);
                  if (!product) return null;

                  const finalPrice = product.discount_percent > 0
                    ? product.price * (1 - product.discount_percent / 100)
                    : product.price;

                  return (
                    <div key={item.id} className="pt-6 first:pt-0 flex gap-4">
                      {/* Product Image */}
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'}
                        alt={product.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#EADFC9] shrink-0 bg-white"
                      />

                      {/* Product Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif font-semibold text-sm text-[#111111] line-clamp-1">
                              {product.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="font-serif font-bold text-sm text-[#111111]">
                              ₹{(finalPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-gray-400 font-sans">
                                (₹{finalPrice.toLocaleString('en-IN')} each)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center border border-[#EADFC9] rounded-full bg-white px-2 py-0.5 gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity - 1)}
                              className="text-gray-500 hover:text-[#111111] p-1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-serif font-bold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity + 1)}
                              className="text-gray-500 hover:text-[#111111] p-1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#111111]">Your bag is empty</h3>
                  <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto">
                    Discover handcrafted solitaire rings, diamond necklaces, and gold earrings.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block px-6 py-2.5 bg-[#111111] text-[#C5A059] hover:bg-[#C5A059] hover:text-white rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#EADFC9] bg-white space-y-4">
              
              {/* Shipping Assurance */}
              <div className="flex items-center gap-2 text-[11px] font-sans text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <Truck className="w-4 h-4 shrink-0" />
                <span>Complimentary Fully Insured Express Delivery Included</span>
              </div>

              {/* Subtotal Calculation */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-sans uppercase tracking-wider text-xs">Estimated Subtotal</span>
                <span className="font-serif font-bold text-lg text-[#111111]">
                  ₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans text-center">
                Discounts, spend reward tiers &amp; coupon codes are applied at checkout.
              </p>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg flex items-center justify-center gap-3 transition-all group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
