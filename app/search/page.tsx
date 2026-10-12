import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { SearchResultView } from '@/components/search/SearchResultView';

export default async function SearchPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: products } = await supabase.from('products').select('*').eq('is_active', true);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        <Header categories={categories || []} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-center py-20 text-xs font-serif text-[#C5A059]">Searching catalog...</div>}>
            <SearchResultView
              allProducts={products || []}
              categories={categories || []}
            />
          </Suspense>
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
