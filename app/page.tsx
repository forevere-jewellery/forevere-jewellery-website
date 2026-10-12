import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ToastProvider } from '@/components/ui/Toast';
import { Sparkles, ArrowRight, ShieldCheck, Tag, Gem, Gift } from 'lucide-react';
import { Category, Product, Offer, HomepageContent } from '@/types/database';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Homepage Content, Categories, Featured Products, and Bank Offers
  const { data: homepageData } = await supabase.from('homepage_content').select('*').single();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: featuredProducts } = await supabase.from('products').select('*').eq('is_featured', true);
  const { data: bankOffers } = await supabase.from('offers').select('*').eq('active', true).order('sort_order', { ascending: true });

  const heroContent: HomepageContent = homepageData || {
    id: 'hp1',
    hero_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920',
    hero_headline: 'Timeless Elegance, Crafted Forever',
    hero_subheadline: 'Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry.',
    about_us_text: 'At Forevere Jewellary, we believe that true luxury lies in master craftsmanship, ethical sourcing, and timeless beauty.'
  };

  const categoryList: Category[] = categories || [];
  const productList: Product[] = featuredProducts || [];
  const offerList: Offer[] = bankOffers || [];

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        {/* Header */}
        <Header categories={categoryList} />

        <main className="flex-grow space-y-20 pb-20">
          
          {/* HERO BANNER SECTION */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#111111]">
            {/* Background Hero Image */}
            <div className="absolute inset-0 z-0 opacity-50">
              <img
                src={heroContent.hero_image}
                alt="Forevere Luxury Jewelry"
                className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Hero Text Overlay */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center sm:text-left space-y-6 text-white py-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#C5A059] text-xs font-serif tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Royal Solitaire &amp; Fine Gold Collection</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-[1.15]">
                {heroContent.hero_headline}
              </h1>

              <p className="text-sm sm:text-lg text-gray-300 font-sans max-w-xl leading-relaxed">
                {heroContent.hero_subheadline}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-[#C5A059] hover:bg-[#A8833C] text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-sans uppercase tracking-[0.2em] rounded-full transition-all text-center"
                >
                  Our Heritage
                </Link>
              </div>
            </div>
          </section>

          {/* BANK OFFERS STRIP */}
          {offerList.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#111111] text-white rounded-2xl p-6 md:p-8 border border-[#C5A059]/40 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-[#C5A059]" />
                    <h3 className="font-serif font-semibold text-lg tracking-wide text-white">Exclusive Bank &amp; Payment Offers</h3>
                  </div>
                  <span className="text-xs text-[#C5A059] font-sans uppercase tracking-widest">Limited Time</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {offerList.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-[#C5A059]/50 transition-colors"
                    >
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-700"
                        />
                      )}
                      <div className="space-y-1">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                          {offer.bank_or_payment_method || 'Special Offer'}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-white">{offer.title}</h4>
                        <p className="text-xs text-gray-300 font-sans">{offer.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FEATURED CATEGORIES GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Curated By Category</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#111111]">Browse Our Collections</h2>
              <p className="text-xs text-gray-500 font-sans max-w-md mx-auto">From solitaire engagement rings to delicate pearl anklets.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-[#EADFC9] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4 text-center"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="relative z-10 space-y-1 text-white">
                    <h3 className="font-serif text-base font-semibold tracking-wide group-hover:text-[#C5A059] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="block text-[10px] font-sans uppercase tracking-widest text-gray-300 group-hover:underline">
                      Shop Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FEATURED PRODUCTS CAROUSEL / GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EADFC9] pb-4">
              <div>
                <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Handcrafted Brilliance</span>
                <h2 className="text-2xl md:text-3xl font-serif text-[#111111]">Featured Masterpieces</h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-sans font-semibold uppercase tracking-widest text-[#111111] hover:text-[#C5A059] flex items-center gap-2 transition-colors"
              >
                <span>View All Jewelry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* BRAND STORY SPOTLIGHT */}
          <section className="bg-[#F8F3E6] border-y border-[#EADFC9] py-16">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
              <Gem className="w-8 h-8 text-[#C5A059] mx-auto" />
              <h2 className="text-3xl md:text-4xl font-serif text-[#111111]">The Forevere Commitment</h2>
              <p className="text-xs md:text-sm text-gray-600 font-sans leading-relaxed tracking-wide">
                {heroContent.about_us_text}
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-block px-8 py-3 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest rounded-full transition-colors"
                >
                  Read Our Full Story
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
}
