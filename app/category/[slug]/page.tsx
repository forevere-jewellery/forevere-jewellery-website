import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { StorefrontListing } from '@/components/product/StorefrontListing';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const currentCategory = (categories || []).find((c: any) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const { data: products } = await supabase.from('products').select('*').eq('is_active', true);
  const categoryProducts = (products || []).filter((p: any) => p.category_id === currentCategory.id);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        <Header categories={categories || []} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <StorefrontListing
            products={categoryProducts}
            categories={categories || []}
            currentCategory={currentCategory}
            title={`${currentCategory.name} Collection`}
            description={currentCategory.description || `Handcrafted fine ${currentCategory.name.toLowerCase()} designed for timeless elegance.`}
          />
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
