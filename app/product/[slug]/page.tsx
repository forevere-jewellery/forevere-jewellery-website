import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { ProductFeedback } from '@/components/ui/ProductFeedback';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: allProducts } = await supabase.from('products').select('*').eq('is_active', true);

  const product = (allProducts || []).find((p: any) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = (allProducts || []).filter(
    (p: any) => p.id !== product.id && p.category_id === product.category_id
  ).slice(0, 4);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
        <Header categories={categories || []} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <ProductDetailView
            product={product}
            relatedProducts={relatedProducts}
            reviews={reviews || []}
          />
          <ProductFeedback productId={product.id} productName={product.name} />
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
