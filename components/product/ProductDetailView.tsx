'use client';

import React, { useState } from 'react';
import { Product, Review } from '@/types/database';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Star, ShieldCheck, Truck, RotateCcw, Play, Minus, Plus, ShoppingBag, Sparkles, Heart } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  reviews: Review[];
}

export function ProductDetailView({ product, relatedProducts, reviews }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>(product.images?.[0] || '');
  const [imageError, setImageError] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  const finalPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '4.9';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity} x ${product.name} to Cart`, 'Shopping bag updated.', 'success');
  };

  return (
    <div className="space-y-16">
      
      {/* Main Product Layout: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Gallery Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Large Main Display */}
          <div className="relative aspect-square rounded-3xl bg-white border border-[#EADFC9] overflow-hidden shadow-sm group">
            {selectedImage && !imageError ? (
              <img
                src={selectedImage}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center select-none">
                <div className="w-14 h-14 rounded-full bg-[#F8F3E6] border border-[#EADFC9] flex items-center justify-center mb-3 text-[#C5A059]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="font-serif text-sm text-[#111111] tracking-wide font-medium">Forevere Fine Atelier</span>
                <span className="text-xs text-gray-400 font-sans mt-1">Image Preview Unavailable</span>
              </div>
            )}

            {/* Video Badge Button */}
            {product.video_url && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="absolute bottom-4 left-4 bg-[#111111]/90 hover:bg-[#C5A059] text-white px-4 py-2 rounded-full text-xs font-serif flex items-center gap-2 shadow-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Craftsmanship Video</span>
              </button>
            )}

            {/* Discount Badge */}
            {product.discount_percent > 0 && (
              <div className="absolute top-4 left-4 bg-[#111111] text-[#C5A059] text-xs font-serif font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
                Save {product.discount_percent}%
              </div>
            )}
          </div>

          {/* Thumbnail Selector Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(img); setImageError(false); }}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-[#C5A059] shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Details & Actions Column (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
                Royal Fine Jewelry
              </span>
              <span className="text-gray-300">&bull;</span>
              {/* Stock Status Badge */}
              {product.stock_quantity > 0 ? (
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-xs text-rose-700 font-medium bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#111111] leading-tight">
              {product.name}
            </h1>

            {/* Star Rating Summary */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <div className="flex items-center text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#111111]">{avgRating}</span>
              <span className="text-gray-400">({totalReviews} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="bg-white border border-[#EADFC9] p-5 rounded-2xl space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-serif font-bold text-[#111111]">
                ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              {product.discount_percent > 0 && (
                <span className="text-sm text-gray-400 line-through font-sans">
                  ₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-sans">Includes all taxes, insured courier delivery &amp; hallmark authentication.</p>
          </div>

          {/* Description */}
          <div className="space-y-2 text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-[#EADFC9]">
            <div className="flex items-center gap-4">
              <span className="text-xs font-sans uppercase tracking-wider text-[#555555]">Quantity:</span>
              <div className="flex items-center border border-[#EADFC9] rounded-full bg-white px-3 py-1.5 gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-gray-500 hover:text-[#111111] p-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold font-serif w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  className="text-gray-500 hover:text-[#111111] p-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="flex-1 py-4 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => showToast('Wishlist', 'Saved to your luxury wishlist.', 'info')}
                className="p-4 rounded-full border border-[#EADFC9] bg-white hover:border-[#C5A059] text-[#111111] hover:text-[#C5A059] transition-colors"
                title="Save to Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EADFC9] text-[11px] font-sans text-gray-500 text-center">
            <div className="p-3 bg-white border border-[#EADFC9] rounded-xl flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Certified Quality</span>
            </div>
            <div className="p-3 bg-white border border-[#EADFC9] rounded-xl flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#C5A059]" />
              <span>Insured Express</span>
            </div>
            <div className="p-3 bg-white border border-[#EADFC9] rounded-xl flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#C5A059]" />
              <span>30-Day Return</span>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS & STAR RATING SUMMARY SECTION */}
      <section className="bg-white border border-[#EADFC9] rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F4EAD3] pb-6">
          <div>
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C5A059]">Verified Buyer Feedback</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#111111]">Client Reviews ({totalReviews})</h2>
          </div>

          <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#EADFC9] px-4 py-2 rounded-2xl">
            <div className="text-2xl font-serif font-bold text-[#111111]">{avgRating}</div>
            <div className="text-xs font-sans">
              <div className="flex text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-gray-400 text-[10px]">Based on {totalReviews} reviews</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6 divide-y divide-[#F4EAD3]">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-sm text-[#111111]">{rev.user_name || 'Verified Buyer'}</span>
                  <span className="text-[11px] text-gray-400 font-sans">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-[#C5A059] gap-1 text-xs">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 font-sans">No reviews yet for this piece. Be the first to leave your feedback!</p>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-[#EADFC9] pb-4">
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C5A059]">Complete The Look</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#111111]">You May Also Adore</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* VIDEO MODAL IF PRESENT */}
      {isVideoModalOpen && product.video_url && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#C5A059] rounded-2xl p-4 max-w-3xl w-full space-y-4">
            <div className="flex items-center justify-between text-white border-b border-gray-800 pb-2">
              <h3 className="font-serif text-sm font-semibold">{product.name} &bull; Craftsmanship Video</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-gray-400 hover:text-white px-2 py-1"
              >
                Close
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <video src={product.video_url} controls autoPlay className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}