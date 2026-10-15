'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/product/ProductCard';
import { searchProducts } from '@/lib/search';
import { Search, Sparkles } from 'lucide-react';

interface SearchResultViewProps {
  allProducts: Product[];
  categories: Category[];
}

export function SearchResultView({ allProducts }: SearchResultViewProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { products, correctedTerm, hasMatches } = useMemo(() => {
    return searchProducts(allProducts, query);
  }, [allProducts, query]);

  return (
    <div className="space-y-10">
      
      {/* Header Banner */}
      <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-[#C5A059]/40 shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#C5A059] text-xs font-serif uppercase tracking-widest">
          <Search className="w-3.5 h-3.5" />
          <span>Fuzzy Match Search Engine</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-serif">
          Search Results for &ldquo;{query}&rdquo;
        </h1>

        {/* Correction Banner */}
        {correctedTerm && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5A059] text-white text-xs font-serif font-semibold rounded-full shadow animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>Showing results for: <strong>{correctedTerm}</strong></span>
          </div>
        )}
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between border-b border-[#EADFC9] pb-4 text-xs font-sans text-[#555555]">
        <span>Found {products.length} matching piece{products.length === 1 ? '' : 's'}</span>
        {query && <span>Query term: &ldquo;{query}&rdquo;</span>}
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <Search className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-xl text-[#111111]">No jewelry found matching &ldquo;{query}&rdquo;</h3>
          <p className="text-xs text-gray-500 font-sans max-w-sm mx-auto">
            Try searching for common terms like &ldquo;Solitaire&rdquo;, &ldquo;Ring&rdquo;, &ldquo;Pendant&rdquo;, or &ldquo;Necklace&rdquo;.
          </p>
        </div>
      )}

    </div>
  );
}
