import Fuse from 'fuse.js';
import { Product } from '@/types/database';

export interface SearchResult {
  products: Product[];
  correctedTerm: string | null;
  hasMatches: boolean;
}

export function searchProducts(allProducts: Product[], query: string): SearchResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return { products: allProducts, correctedTerm: null, hasMatches: true };
  }

  const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Allows fuzzy matching for typos
    keys: ['name', 'description', 'slug']
  };

  const fuse = new Fuse(allProducts, fuseOptions);
  const results = fuse.search(trimmed);

  if (results.length === 0) {
    return { products: [], correctedTerm: null, hasMatches: false };
  }

  const matchedProducts = results.map((res) => res.item);

  // Determine if fuzzy correction applied
  const exactMatch = allProducts.some(
    (p) => p.name.toLowerCase().includes(trimmed.toLowerCase()) || p.description?.toLowerCase().includes(trimmed.toLowerCase())
  );

  let correctedTerm: string | null = null;
  if (!exactMatch && matchedProducts.length > 0) {
    // Extract best matching word or product title keyword
    const bestProduct = matchedProducts[0];
    correctedTerm = bestProduct.name;
  }

  return {
    products: matchedProducts,
    correctedTerm,
    hasMatches: true
  };
}
