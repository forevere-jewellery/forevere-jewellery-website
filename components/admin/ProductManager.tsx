'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import {
  Gem,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff,
  Video,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export function ProductManager() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(10000);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'
  ]);
  const [newImageInput, setNewImageInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    mockDB.loadFromLocalStorage();
    setProducts([...mockDB.products]);
    setCategories([...mockDB.categories]);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice(15000);
    setDiscountPercent(0);
    setStockQuantity(10);
    setImageUrls(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800']);
    setNewImageInput('');
    setVideoUrl('');
    setIsFeatured(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setCategoryId(prod.category_id || '');
    setDescription(prod.description || '');
    setPrice(prod.price);
    setDiscountPercent(prod.discount_percent);
    setStockQuantity(prod.stock_quantity);
    setImageUrls(prod.images || []);
    setNewImageInput('');
    setVideoUrl(prod.video_url || '');
    setIsFeatured(prod.is_featured);
    setIsActive(prod.is_active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleAddImageUrl = () => {
    if (newImageInput.trim()) {
      setImageUrls((prev) => [...prev, newImageInput.trim()]);
      setNewImageInput('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleActive = (prod: Product) => {
    mockDB.products = mockDB.products.map((p) =>
      p.id === prod.id ? { ...p, is_active: !p.is_active, updated_at: new Date().toISOString() } : p
    );
    mockDB.saveToLocalStorage();
    loadData();
    showToast(
      prod.is_active ? 'Product Deactivated' : 'Product Activated',
      `"${prod.name}" status updated on live storefront.`,
      'info'
    );
  };

  const handleInlineStockChange = (prod: Product, newStock: number) => {
    const validStock = Math.max(0, newStock);
    mockDB.products = mockDB.products.map((p) =>
      p.id === prod.id ? { ...p, stock_quantity: validStock, updated_at: new Date().toISOString() } : p
    );
    mockDB.saveToLocalStorage();
    loadData();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      showToast('Validation Error', 'Product title and slug are required.', 'warning');
      return;
    }

    if (price < 0) {
      showToast('Validation Error', 'Price must be positive.', 'warning');
      return;
    }

    if (editingProduct) {
      // Update
      mockDB.products = mockDB.products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: name.trim(),
              slug: slug.trim(),
              category_id: categoryId || null,
              description: description.trim() || null,
              price: Number(price),
              discount_percent: Number(discountPercent),
              stock_quantity: Number(stockQuantity),
              images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'],
              video_url: videoUrl.trim() || null,
              is_featured: isFeatured,
              is_active: isActive,
              updated_at: new Date().toISOString()
            }
          : p
      );
      showToast('Product Updated', `Saved changes to "${name}".`, 'success');
    } else {
      // Add
      const newProd: Product = {
        id: 'p-' + Date.now(),
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId || null,
        description: description.trim() || null,
        price: Number(price),
        discount_percent: Number(discountPercent),
        stock_quantity: Number(stockQuantity),
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'],
        video_url: videoUrl.trim() || null,
        is_featured: isFeatured,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDB.products.push(newProd);
      showToast('Product Created', `Added "${name}" to catalog. Available immediately.`, 'success');
    }

    mockDB.saveToLocalStorage();
    loadData();
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (prod: Product) => {
    mockDB.products = mockDB.products.filter((p) => p.id !== prod.id);
    mockDB.saveToLocalStorage();
    loadData();
    setDeleteConfirmProduct(null);
    showToast('Product Removed', `"${prod.name}" has been deleted.`, 'info');
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EADFC9] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider mb-2">
            <Gem className="w-3.5 h-3.5" />
            <span>Product Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#111111]">Jewelry Masterpieces</h1>
          <p className="text-xs text-gray-500 font-sans">
            Shopify-style management: inline stock editing, active toggles, multi-image upload &amp; live syncing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 min-h-[44px] bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EADFC9] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
          <span className="text-gray-500 shrink-0">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 md:flex-none bg-[#FDFBF7] border border-[#EADFC9] rounded-xl px-3 py-2 text-base sm:text-xs text-[#111111] font-medium focus:outline-none focus:border-[#C5A059]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Product Table */}
      <div className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[700px]">
            <thead className="bg-[#F8F3E6] text-[#555555] uppercase tracking-wider text-[10px] border-b border-[#EADFC9]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Image</th>
                <th className="py-3.5 px-4 font-semibold">Product &amp; Category</th>
                <th className="py-3.5 px-4 font-semibold">Price &amp; Discount</th>
                <th className="py-3.5 px-4 font-semibold">Stock Qty (Inline Edit)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EAD3]">
              {filteredProducts.map((prod) => {
                const category = categories.find((c) => c.id === prod.category_id);
                const finalPrice = prod.discount_percent > 0
                  ? prod.price * (1 - prod.discount_percent / 100)
                  : prod.price;

                return (
                  <tr key={prod.id} className="hover:bg-[#FDFBF7] transition-colors">
                    {/* Image */}
                    <td className="py-3.5 px-4">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'}
                        alt={prod.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#EADFC9]"
                      />
                    </td>

                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-serif font-semibold text-sm text-[#111111] block">
                        {prod.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-[#F8F3E6] border border-[#EADFC9] px-2 py-0.5 rounded text-[#C5A059] font-medium">
                          {category?.name || 'Uncategorized'}
                        </span>
                        {prod.is_featured && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                            Featured
                          </span>
                        )}
                        {prod.video_url && (
                          <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                            <Video className="w-3 h-3" /> Video
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-serif font-bold text-sm text-[#111111] block">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                      {prod.discount_percent > 0 && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{prod.price.toLocaleString('en-IN')} ({prod.discount_percent}% off)
                        </span>
                      )}
                    </td>

                    {/* Inline Stock Editing */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={prod.stock_quantity}
                          onChange={(e) => handleInlineStockChange(prod, Number(e.target.value))}
                          className={`w-20 px-2.5 py-1 rounded-lg border text-center font-bold text-xs ${
                            prod.stock_quantity === 0
                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                              : prod.stock_quantity < 5
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-[#EADFC9] bg-white text-[#111111]'
                          }`}
                        />
                        <span className="text-[10px] text-gray-400">units</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          prod.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Click to toggle live visibility"
                      >
                        {prod.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{prod.is_active ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-gray-600 hover:text-[#C5A059] hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProduct(prod)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-150 my-8">
            
            <div className="flex items-center justify-between border-b border-[#EADFC9] pb-4">
              <h3 className="font-serif text-xl font-semibold text-[#111111]">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Fine Jewelry Piece'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#111111] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Celestial Diamond Solitaire Ring"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  />
                  <p className="text-[10px] text-gray-400">Descriptive luxury name of the jewelry item.</p>
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="celestial-diamond-solitaire-ring"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111] font-mono"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  />
                </div>

                {/* Discount % */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                    Stock Available (Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  />
                </div>
              </div>

              {/* Rich Description */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Description &amp; Gemstone Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Handcrafted in 18K solid yellow gold featuring a luminous solitaire diamond..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
              </div>

              {/* Multi-Image Upload / URL Manager */}
              <div className="space-y-2">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Product Imagery (Gallery)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                    value={newImageInput}
                    onChange={(e) => setNewImageInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-5 py-2.5 min-h-[44px] bg-[#F8F3E6] border border-[#EADFC9] text-[#C5A059] hover:bg-[#C5A059] hover:text-white rounded-xl font-semibold transition-colors shrink-0 flex items-center justify-center"
                  >
                    Add Image
                  </button>
                </div>

                {/* Thumbnails list */}
                <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-1">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EADFC9] shrink-0 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Craftsmanship Video URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Active (Visible in Store)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-[#EADFC9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 min-h-[44px] flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 min-h-[44px] flex items-center justify-center bg-[#111111] hover:bg-[#C5A059] text-white font-semibold rounded-full shadow transition-colors"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE PRODUCT MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#111111]">
              Delete &ldquo;{deleteConfirmProduct.name}&rdquo;?
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              This will permanently remove the piece from the store catalog.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-5 py-2 text-xs font-sans font-semibold rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmProduct)}
                className="px-5 py-2 text-xs font-sans font-semibold rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
