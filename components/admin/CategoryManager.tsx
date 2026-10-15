'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import {
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export function CategoryManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);

  // Delete modal state
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    mockDB.loadFromLocalStorage();
    const sorted = [...mockDB.categories].sort((a, b) => a.sort_order - b.sort_order);
    setCategories(sorted);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800');
    setSortOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      showToast('Validation Error', 'Category name and slug are required.', 'warning');
      return;
    }

    if (editingCategory) {
      // Update existing
      mockDB.categories = mockDB.categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: name.trim(),
              slug: slug.trim(),
              description: description.trim() || null,
              image_url: imageUrl.trim() || null,
              sort_order: Number(sortOrder)
            }
          : c
      );
      showToast('Category Updated', `Updated "${name}" successfully.`, 'success');
    } else {
      // Add new
      const newCat: Category = {
        id: 'c-' + Date.now(),
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        sort_order: Number(sortOrder),
        created_at: new Date().toISOString()
      };
      mockDB.categories.push(newCat);
      showToast('Category Added', `Created new collection "${name}".`, 'success');
    }

    mockDB.saveToLocalStorage();
    loadCategories();
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    mockDB.categories = mockDB.categories.filter((c) => c.id !== cat.id);
    mockDB.saveToLocalStorage();
    loadCategories();
    setDeleteConfirmCategory(null);
    showToast('Category Deleted', `Removed "${cat.name}".`, 'info');
  };

  const handleReorder = (idx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === categories.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const current = categories[idx];
    const target = categories[targetIdx];

    const currentOrder = current.sort_order;
    current.sort_order = target.sort_order;
    target.sort_order = currentOrder;

    mockDB.saveToLocalStorage();
    loadCategories();
    showToast('Order Updated', 'Category display order updated.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EADFC9] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider mb-2">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Store Taxonomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#111111]">Category Management</h1>
          <p className="text-xs text-gray-500 font-sans">
            Add, edit, reorder, and configure luxury jewelry collection categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 min-h-[44px] bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[600px]">
            <thead className="bg-[#F8F3E6] text-[#555555] uppercase tracking-wider text-[10px] border-b border-[#EADFC9]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Display Order</th>
                <th className="py-3.5 px-4 font-semibold">Image</th>
                <th className="py-3.5 px-4 font-semibold">Name &amp; Slug</th>
                <th className="py-3.5 px-4 font-semibold">Description</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EAD3]">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-gray-700 w-5 text-center">
                        {cat.sort_order}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleReorder(idx, 'up')}
                          className="p-1 text-gray-400 hover:text-[#111111] disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === categories.length - 1}
                          onClick={() => handleReorder(idx, 'down')}
                          className="p-1 text-gray-400 hover:text-[#111111] disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#EADFC9]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-serif font-semibold text-sm text-[#111111] block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#C5A059] font-mono">
                      /category/{cat.slug}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 text-gray-600 hover:text-[#C5A059] hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCategory(cat)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-150">
            
            <div className="flex items-center justify-between border-b border-[#EADFC9] pb-4">
              <h3 className="font-serif text-xl font-semibold text-[#111111]">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Collection Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#111111] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-sans">
              
              {/* Category Name */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solitaire Rings"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
                <p className="text-[10px] text-gray-400">The primary collection heading displayed to shoppers.</p>
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. royal-solitaire-rings"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111] font-mono"
                />
                <p className="text-[10px] text-gray-400">URL path formatted in kebab-case (e.g. /category/slug).</p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Exquisite solitary and diamond engagement rings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
                <p className="text-[10px] text-gray-400">Editorial description displayed at the top of the collection page.</p>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
                <p className="text-[10px] text-gray-400">High-resolution banner imagery for category tiles.</p>
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                  Sort Display Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111]"
                />
                <p className="text-[10px] text-gray-400">Lower numbers appear first on the navbar and homepage.</p>
              </div>

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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#111111]">
              Delete Category &ldquo;{deleteConfirmCategory.name}&rdquo;?
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              Are you sure you want to remove this category? Associated products will have their category unassigned.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmCategory(null)}
                className="px-5 py-2 text-xs font-sans font-semibold rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmCategory)}
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
