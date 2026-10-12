'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import { Star, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [imageError, setImageError] = useState(false);

  const finalPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`Added ${product.name}`, 'Shopping bag updated.', 'success');
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-2xl border border-[#EADFC9] overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-[#FDFBF7] overflow-hidden">
          {product.images && product.images[0] && !imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-[#F8F3E6] border border-[#EADFC9] flex items-center justify-center mb-2 text-[#C5A059]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif text-xs text-[#111111] tracking-wide font-medium">Forevere Atelier</span>
              <span className="text-[10px] text-gray-400 font-sans mt-0.5">Fine Jewelry</span>
            </div>
          )}

          {/* Discount Badge */}
          {product.discount_percent > 0 && (
            <div className="absolute top-3 left-3 bg-[#111111] text-[#C5A059] text-[10px] font-serif font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
              {product.discount_percent}% OFF
            </div>
          )}

          {/* Quick Add overlay button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-white/95 text-[#111111] hover:bg-[#C5A059] hover:text-white p-2.5 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-2">
          {/* Rating summary */}
          <div className="flex items-center gap-1 text-[#C5A059] text-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold text-[11px] text-[#111111]">4.9</span>
            <span className="text-[10px] text-gray-400 font-sans">(12)</span>
          </div>

          <h3 className="font-serif font-medium text-sm md:text-base text-[#111111] group-hover:text-[#C5A059] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#F4EAD3]">
        <div className="flex items-baseline gap-2">
          <span className="font-serif font-bold text-base text-[#111111]">
            ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
          {product.discount_percent > 0 && (
            <span className="text-xs text-gray-400 line-through font-sans">
              ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <span className="text-[10px] font-sans font-semibold text-[#C5A059] uppercase tracking-wider group-hover:underline">
          View Detail
        </span>
      </div>
    </Link>
  );
}
