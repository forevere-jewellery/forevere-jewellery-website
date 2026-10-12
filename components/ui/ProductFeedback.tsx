'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/supabase/mock-db';
import { Review } from '@/types/database';

interface ProductFeedbackProps {
  productId: string;
  productName: string;
}

export function ProductFeedback({ productId, productName }: ProductFeedbackProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (rating === 0) {
      showToast('Rating Required', 'Please select a star rating.', 'warning');
      return;
    }

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
      created_at: new Date().toISOString(),
      user_name: user.full_name || 'Verified Buyer'
    };

    mockDB.reviews.push(newReview);
    mockDB.saveToLocalStorage();
    setSubmitted(true);
    showToast('Review Submitted', 'Thank you for your feedback!', 'success');
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4 text-xs font-sans">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
        <div>
          <p className="font-serif font-semibold text-emerald-800 text-sm">Thank You for Your Review!</p>
          <p className="text-emerald-700 mt-0.5">Your feedback helps other Forevere customers make informed decisions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between gap-3 hover:bg-[#FDFBF7] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="font-serif font-semibold text-sm text-[#111111]">Share Your Experience</p>
            <p className="text-[11px] text-gray-500 font-sans">Leave a verified review for {productName}</p>
          </div>
        </div>
        <span className={`text-xs font-sans text-[#C5A059] font-semibold transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 border-t border-[#F4EAD3] animate-in fade-in">
          {/* Star Rating */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-gray-600">Your Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-xs font-serif text-[#C5A059] font-semibold">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-gray-600">Your Review</label>
            <textarea
              rows={3}
              placeholder="Tell us about the quality, craftsmanship, packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-xs font-sans text-[#111111] focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </form>
      )}
    </div>
  );
}
