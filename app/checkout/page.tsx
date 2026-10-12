import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckoutWorkflow } from '@/components/checkout/CheckoutWorkflow';
import { createClient } from '@/lib/supabase/server';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
      <Header categories={categories || []} />
      <main className="flex-grow">
        <CheckoutWorkflow />
      </main>
      <Footer />
    </div>
  );
}
