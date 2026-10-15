import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { Gem, Award, ShieldCheck, Heart } from 'lucide-react';
import { HomepageContent } from '@/types/database';

export default async function AboutPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: homepageData } = await supabase.from('homepage_content').select('*').single();

  const content: HomepageContent = homepageData || {
    id: 'hp1',
    hero_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920',
    hero_headline: 'Timeless Elegance, Crafted Forever',
    hero_subheadline: 'Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry.',
    about_us_text: 'At Forevere Jewellery, we believe that true luxury lies in master craftsmanship, ethical sourcing, and timeless beauty. Founded with a vision to revolutionize fine jewelry, every ring, necklace, and earring is meticulously created by master artisans using 100% recycled gold and ethically sourced conflict-free diamonds.'
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        <Header categories={categories || []} />

        <main className="flex-grow space-y-16 pb-20">
          
          {/* About Header */}
          <section className="bg-[#111111] text-white py-20 text-center relative overflow-hidden border-b border-[#C5A059]/40">
            <div className="max-w-4xl mx-auto px-6 space-y-4 relative z-10">
              <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Our Heritage &amp; Craft</span>
              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight">About Forevere Jewellery</h1>
              <p className="text-xs sm:text-base text-gray-300 font-sans max-w-xl mx-auto leading-relaxed">
                Dedicated to master craftsmanship, certified diamonds, and lifelong elegance.
              </p>
            </div>
          </section>

          {/* Main About Content (Render homepage_content.about_us_text) */}
          <section className="max-w-4xl mx-auto px-6 space-y-8 text-center sm:text-left">
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4EAD3] pb-4">
                <Gem className="w-6 h-6 text-[#C5A059]" />
                <h2 className="font-serif text-2xl font-semibold text-[#111111]">The Forevere Story</h2>
              </div>

              <div className="text-sm sm:text-base text-gray-700 font-sans leading-relaxed space-y-4">
                <p>{content.about_us_text}</p>
                <p>
                  Our commitment extends beyond creating exquisite jewelry. We ensure every single piece is certified, hallmarked, and backed by a lifetime warranty of cleaning and maintenance.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Pillars of Luxury</span>
              <h2 className="text-3xl font-serif text-[#111111]">Why Choose Forevere</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#EADFC9] rounded-2xl p-8 text-center space-y-3 shadow-sm">
                <Award className="w-8 h-8 text-[#C5A059] mx-auto" />
                <h3 className="font-serif text-lg text-[#111111]">100% Conflict-Free</h3>
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Ethically sourced lab-grown &amp; natural diamonds meeting the highest ethical standards.
                </p>
              </div>

              <div className="bg-white border border-[#EADFC9] rounded-2xl p-8 text-center space-y-3 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-[#C5A059] mx-auto" />
                <h3 className="font-serif text-lg text-[#111111]">Hallmarked Gold</h3>
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Certified 18K and 14K gold authenticated by international jewelry gemological institutes.
                </p>
              </div>

              <div className="bg-white border border-[#EADFC9] rounded-2xl p-8 text-center space-y-3 shadow-sm">
                <Heart className="w-8 h-8 text-[#C5A059] mx-auto" />
                <h3 className="font-serif text-lg text-[#111111]">Lifetime Guarantee</h3>
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Free prong inspections, cleaning, re-polishing, and maintenance for your heirloom pieces.
                </p>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
