'use client';

import React, { useState, useEffect } from 'react';
import { HomepageContent } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import { Home, Sparkles, Image as ImageIcon, Save, Eye } from 'lucide-react';

export function HomepageEditor() {
  const { showToast } = useToast();
  const [heroImage, setHeroImage] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [aboutUsText, setAboutUsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    mockDB.loadFromLocalStorage();
    const content = mockDB.homepageContent;
    setHeroImage(content.hero_image || '');
    setHeroHeadline(content.hero_headline || '');
    setHeroSubheadline(content.hero_subheadline || '');
    setAboutUsText(content.about_us_text || '');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: HomepageContent = {
      id: mockDB.homepageContent.id || 'hp1',
      hero_image: heroImage.trim() || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920',
      hero_headline: heroHeadline.trim() || 'Timeless Elegance, Crafted Forever',
      hero_subheadline: heroSubheadline.trim() || 'Discover our hand-curated collection of fine jewelry.',
      about_us_text: aboutUsText.trim() || 'At Forevere Jewellery, we craft heirloom luxury.'
    };

    mockDB.homepageContent = updated;
    mockDB.saveToLocalStorage();
    setIsSaving(false);
    showToast('Content Published', 'Homepage hero banner and About story updated live on storefront.', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <Home className="w-3.5 h-3.5" />
          <span>Brand Showcase Editor</span>
        </div>
        <h1 className="text-3xl font-serif text-[#111111]">Homepage &amp; Story Editor</h1>
        <p className="text-xs text-gray-500 font-sans">
          Customize the storefront hero banner, primary headlines, and the About Us brand heritage story.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* HERO BANNER SECTION */}
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F4EAD3] pb-4">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif text-lg font-semibold text-[#111111]">Storefront Hero Section</h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            
            {/* Hero Image URL */}
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                Hero Background Image URL *
              </label>
              <input
                type="url"
                required
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-[#111111]"
              />
              <p className="text-[10px] text-gray-400">High-resolution cinematic image recommended (1920x1080).</p>
            </div>

            {/* Hero Headline */}
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                Main Hero Headline *
              </label>
              <input
                type="text"
                required
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                placeholder="Timeless Elegance, Crafted Forever"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-[#111111] font-serif text-base"
              />
            </div>

            {/* Hero Subheadline */}
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                Subheadline &amp; Value Proposition *
              </label>
              <textarea
                rows={2}
                required
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                placeholder="Discover our hand-curated collection of ethical diamond rings, gold necklaces, and heirloom jewelry."
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-[#111111]"
              />
            </div>

          </div>

          {/* Live Preview Card */}
          <div className="mt-6 p-6 rounded-2xl bg-[#111111] text-white relative overflow-hidden border border-[#C5A059]/40 space-y-4">
            <div className="flex items-center gap-2 text-[#C5A059] text-[10px] uppercase tracking-widest font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Visual Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif">{heroHeadline || 'Your Hero Headline'}</h2>
            <p className="text-xs text-gray-300 font-sans max-w-lg">{heroSubheadline || 'Your subheadline text will render here.'}</p>
          </div>
        </div>

        {/* ABOUT US STORY SECTION */}
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F4EAD3] pb-4">
            <ImageIcon className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif text-lg font-semibold text-[#111111]">About Us &amp; Brand Story Text</h3>
          </div>

          <div className="space-y-1 text-xs font-sans">
            <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
              Brand Story / Heritage Narrative *
            </label>
            <textarea
              rows={5}
              required
              value={aboutUsText}
              onChange={(e) => setAboutUsText(e.target.value)}
              placeholder="At Forevere Jewellery, we believe that true luxury lies in master craftsmanship..."
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-base sm:text-xs text-[#111111] leading-relaxed"
            />
            <p className="text-[10px] text-gray-400">Renders on both the homepage brand spotlight and the dedicated /about page.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
