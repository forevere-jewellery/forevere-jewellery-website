import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OrderConfirmationView } from '@/components/checkout/OrderConfirmationView';
import { createClient } from '@/lib/supabase/server';

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
      <Header categories={categories || []} />
      <main className="flex-grow">
        <OrderConfirmationView orderId={orderId} />
      </main>
      <Footer />
    </div>
  );
}
