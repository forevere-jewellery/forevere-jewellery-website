'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/product/ProductCard';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface StorefrontListingProps {
  products: Product[];
  categories: Category[];
  currentCategory?: Category | null;
  title: string;
  description?: string;
}

export function StorefrontListing({
  products,
  categories,
  currentCategory,
  title,
  description
}: StorefrontListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory?.id || 'all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-low' | 'price-high' | 'newest'>('popularity');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      const finalPrice = p.discount_percent > 0 ? p.price * (1 - p.discount_percent / 100) : p.price;
      const matchPrice = finalPrice <= maxPrice;
      return matchCategory && matchPrice;
    }).sort((a, b) => {
      const priceA = a.discount_percent > 0 ? a.price * (1 - a.discount_percent / 100) : a.price;
      const priceB = b.discount_percent > 0 ? b.price * (1 - b.discount_percent / 100) : b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return b.is_featured ? 1 : -1; // Popularity
    });
  }, [products, selectedCategory, maxPrice, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-10">
      
      {/* Category Banner Header */}
      <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-[#C5A059]/40 shadow-lg">
        <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#C5A059]">Fine Jewelry Catalog</span>
        <h1 className="text-3xl sm:text-5xl font-serif tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white border border-[#EADFC9] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#111111] text-[#C5A059]'
                : 'bg-[#FDFBF7] text-[#555555] hover:bg-[#F8F3E6] border border-[#EADFC9]'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#111111] text-[#C5A059]'
                  : 'bg-[#FDFBF7] text-[#555555] hover:bg-[#F8F3E6] border border-[#EADFC9]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price Slider & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 w-full md:w-auto text-xs font-sans">
          
          {/* Price Range Filter */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[#555555]">Max Price:</span>
            <span className="font-serif font-bold text-[#111111]">₹{maxPrice.toLocaleString('en-IN')}</span>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
              className="accent-[#C5A059] cursor-pointer w-24 sm:w-32"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[#555555]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FDFBF7] border border-[#EADFC9] rounded-lg px-3 py-1.5 text-xs text-[#111111] font-medium focus:outline-none focus:border-[#C5A059]"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

        </div>

      </div>

      {/* Product Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EADFC9] rounded-2xl p-12 text-center space-y-3">
          <h3 className="font-serif text-lg text-[#111111]">No jewelry matched your filters</h3>
          <p className="text-xs text-gray-500 font-sans">Try adjusting your price threshold or selecting a different category.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setMaxPrice(50000); }}
            className="px-6 py-2 bg-[#111111] text-[#C5A059] text-xs font-sans uppercase tracking-wider rounded-full hover:bg-[#C5A059] hover:text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 text-xs font-sans">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="p-2 rounded-lg border border-[#EADFC9] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[#555555]">
            Page <strong className="text-[#111111]">{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="p-2 rounded-lg border border-[#EADFC9] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
