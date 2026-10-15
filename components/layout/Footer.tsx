import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Share2, Globe, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 border-t border-[#C5A059]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Brand Commitments Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-800 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-serif font-semibold tracking-wider text-white uppercase">Insured Express Shipping</h4>
            <p className="text-[11px] text-gray-400 font-sans">Discreet, fully insured delivery straight to your doorstep.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-serif font-semibold tracking-wider text-white uppercase">Certified Excellence</h4>
            <p className="text-[11px] text-gray-400 font-sans">Every diamond &amp; gemstone comes with authentic certification.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-serif font-semibold tracking-wider text-white uppercase">30-Day Hassle Returns</h4>
            <p className="text-[11px] text-gray-400 font-sans">Complimentary return &amp; exchange process with 100% money back.</p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-serif font-semibold tracking-wider text-white uppercase">Lifetime Warranty</h4>
            <p className="text-[11px] text-gray-400 font-sans">Free cleaning, prongs inspection, and maintenance forever.</p>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 text-xs font-sans">
          
          {/* Col 1: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <h3 className="text-2xl font-serif text-white tracking-wide">FOREVERE JEWELLERY</h3>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Creating heirloom-quality solitaire diamond rings, necklaces, earrings, and fine jewelry. Handcrafted with passion, ethically sourced gold, and precision brilliance.
            </p>
            <div className="flex items-center gap-4 text-gray-400 pt-2">
              <a href="#" className="hover:text-[#C5A059] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Social Media">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-[#C5A059] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Global Store">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Collections */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold uppercase tracking-widest text-[#C5A059]">Collections</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/category/rings" className="hover:text-white transition-colors">Solitaire Rings</Link></li>
              <li><Link href="/category/necklaces" className="hover:text-white transition-colors">Diamond Necklaces</Link></li>
              <li><Link href="/category/earrings" className="hover:text-white transition-colors">Pearl &amp; Gold Earrings</Link></li>
              <li><Link href="/category/bracelets" className="hover:text-white transition-colors">Tennis Bracelets</Link></li>
              <li><Link href="/category/anklets" className="hover:text-white transition-colors">Charm Anklets</Link></li>
              <li><Link href="/category/pendants" className="hover:text-white transition-colors">Gemstone Pendants</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold uppercase tracking-widest text-[#C5A059]">Customer Service</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="mailto:foreverejewellery@gmail.com?subject=Inquiry" className="hover:text-white transition-colors">Contact Concierge</a></li>
              <li><span className="hover:text-white cursor-pointer">Shipping &amp; Delivery</span></li>
              <li><span className="hover:text-white cursor-pointer">Returns &amp; Exchanges</span></li>
              <li><span className="hover:text-white cursor-pointer">Ring Sizing Guide</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy &amp; Terms</span></li>
            </ul>
          </div>

          {/* Col 4: Concierge Contact */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold uppercase tracking-widest text-[#C5A059]">Concierge</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>5th Avenue Luxury District, NY</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+1 (800) 555-FOREVERE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>foreverejewellery@gmail.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center text-[11px] text-gray-500 font-sans flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Forevere Jewellery Inc. All rights reserved.</p>
          <p className="text-gray-400">Handcrafted with perfection for timeless moments.</p>
        </div>

      </div>
    </footer>
  );
}
