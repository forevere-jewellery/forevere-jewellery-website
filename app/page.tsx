import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ToastProvider } from '@/components/ui/Toast';
import { Sparkles, ArrowRight, Gem } from 'lucide-react';
import { Category, Product, HomepageContent } from '@/types/database';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Homepage Content, Categories, and Featured Products
  const { data: homepageData } = await supabase.from('homepage_content').select('*').single();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: featuredProducts } = await supabase.from('products').select('*').eq('is_featured', true);

  const heroContent: HomepageContent = homepageData || {
    id: 'hp1',
    hero_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920',
    hero_headline: 'Timeless Elegance, Crafted Forever',
    hero_subheadline: 'Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry.',
    about_us_text: 'At Forevere Jewellery, we believe that true luxury lies in master craftsmanship, ethical sourcing, and timeless beauty.'
  };

  const categoryList: Category[] = categories || [];
  const productList: Product[] = featuredProducts || [];

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        {/* Header */}
        <Header categories={categoryList} />

        <main className="flex-grow space-y-12 sm:space-y-16 md:space-y-20 pb-16 sm:pb-20">
          
          {/* HERO BANNER SECTION */}
          <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#111111]">
            {/* Background Hero Image */}
            <div className="absolute inset-0 z-0 opacity-50">
              <img
                src={heroContent.hero_image}
                alt="Forevere Luxury Jewelry"
                className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30 sm:to-transparent" />
            </div>

            {/* Hero Text Overlay */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-6 text-white py-16 sm:py-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#C5A059] text-[10px] sm:text-xs font-serif tracking-wider sm:tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>The Royal Solitaire &amp; Fine Gold Collection</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.15]">
                {heroContent.hero_headline}
              </h1>

              <p className="text-xs sm:text-base md:text-lg text-gray-300 font-sans max-w-xl leading-relaxed">
                {heroContent.hero_subheadline}
              </p>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 sm:py-4 bg-[#C5A059] hover:bg-[#A8833C] text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-sans uppercase tracking-[0.2em] rounded-full transition-all flex items-center justify-center text-center"
                >
                  Our Heritage
                </Link>
              </div>
            </div>
          </section>

          {/* FEATURED CATEGORIES GRID (2 columns on mobile, 3 on tablet/desktop) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Curated By Category</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111111]">Browse Our Collections</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-sans max-w-md mx-auto">From solitaire engagement rings to delicate pearl anklets.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 md:gap-6">
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-[#EADFC9] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-3 sm:p-5 text-center"
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
                    <h3 className="font-serif text-sm sm:text-base font-semibold tracking-wide group-hover:text-[#C5A059] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="block text-[9px] sm:text-[10px] font-sans uppercase tracking-widest text-gray-300 group-hover:underline">
                      Shop Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FEATURED PRODUCTS GRID (1-2 columns on mobile, 3-4 on desktop) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EADFC9] pb-4">
              <div>
                <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Handcrafted Brilliance</span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#111111]">Featured Masterpieces</h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-sans font-semibold uppercase tracking-widest text-[#111111] hover:text-[#C5A059] flex items-center gap-2 transition-colors min-h-[44px]"
              >
                <span>View All Jewelry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* BRAND STORY SPOTLIGHT */}
          <section className="bg-[#F8F3E6] border-y border-[#EADFC9] py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
              <Gem className="w-8 h-8 text-[#C5A059] mx-auto" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111111]">The Forevere Commitment</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed tracking-wide max-w-2xl mx-auto">
                {heroContent.about_us_text}
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest rounded-full transition-colors"
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
