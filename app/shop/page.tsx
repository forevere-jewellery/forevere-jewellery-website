import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { StorefrontListing } from '@/components/product/StorefrontListing';

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: products } = await supabase.from('products').select('*').eq('is_active', true);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        <Header categories={categories || []} />
        
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <StorefrontListing
            products={products || []}
            categories={categories || []}
            title="All Fine Jewelry"
            description="Explore our full collection of ethically handcrafted solitaire diamond rings, necklaces, earrings, bracelets, anklets, and initial pendants."
          />
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
