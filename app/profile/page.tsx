import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomerProfileView } from '@/components/profile/CustomerProfileView';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#111111]">
      <Header categories={categories || []} />
      <main className="flex-grow">
        <CustomerProfileView />
      </main>
      <Footer />
    </div>
  );
}
