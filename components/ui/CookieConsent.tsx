'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fj_cookie_consent');
    if (!consent) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fj_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('fj_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 sm:left-8 z-40 max-w-sm w-[calc(100vw-32px)] sm:w-auto bg-white border border-[#EADFC9] rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-semibold text-sm text-[#111111]">Your Privacy Matters</h4>
          <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
            We use cookies to enhance your luxury shopping experience, remember your preferences, and analyze site performance. Your data is never sold.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-colors"
        >
          Accept All
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-colors"
        >
          Essential Only
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-sans">
        <Shield className="w-3 h-3" />
        <span>Your privacy is protected under our data policy.</span>
      </div>
    </div>
  );
}
