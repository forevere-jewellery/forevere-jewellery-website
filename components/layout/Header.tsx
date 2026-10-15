'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Sparkles, LogOut, Shield, Package } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useCart } from '@/components/cart/CartContext';
import { Category } from '@/types/database';

interface HeaderProps {
  categories?: Category[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Rings', slug: 'rings', description: null, image_url: null, sort_order: 1 },
  { id: 'c2', name: 'Necklaces', slug: 'necklaces', description: null, image_url: null, sort_order: 2 },
  { id: 'c3', name: 'Earrings', slug: 'earrings', description: null, image_url: null, sort_order: 3 },
  { id: 'c4', name: 'Bracelets', slug: 'bracelets', description: null, image_url: null, sort_order: 4 },
  { id: 'c5', name: 'Anklets', slug: 'anklets', description: null, image_url: null, sort_order: 5 },
];

export function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, openAuthModal, logout } = useAuth();
  const { openCart, totalItems } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close drawer on ESC key and prevent body scrolling when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileDrawerOpen(false);
    }
  };

  const handleUserClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  // Nav categories: guarantee the 5 primary categories (Rings, Necklaces, Earrings, Bracelets, Anklets)
  const navCategories = categories.length > 0 ? categories.slice(0, 5) : DEFAULT_CATEGORIES;

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADFC9]/60">
      
      {/* ─── TOP ANNOUNCEMENT BANNER ─── */}
      <div className="bg-[#111111] text-white text-[10px] sm:text-xs font-sans py-2 px-3 sm:px-4 text-center flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0 animate-pulse" />
        <span className="tracking-wider sm:tracking-widest uppercase text-center break-words leading-tight">
          Complimentary Worldwide Express Shipping &amp; Luxury Gift Box
        </span>
        <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0 animate-pulse hidden sm:inline" />
      </div>

      {/* ─── MAIN NAVBAR BAR ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* ══════════════════════════════════════════════════════════
            DESKTOP LAYOUT (xl: 1280px+)
            - Left: Nav links (ALL JEWELRY, RINGS, NECKLACES, EARRINGS, BRACELETS, ANKLETS, ABOUT US)
            - Center: Search, Account, Cart icons
            - Far Right: Logo (FOREVERE + JEWELLERY tagline)
            ══════════════════════════════════════════════════════════ */}

        {/* Desktop Left: Category Navigation */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 text-xs font-sans uppercase tracking-widest text-[#444444]">
          <Link href="/shop" className="hover:text-[#C5A059] transition-colors font-medium">
            All Jewelry
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="hover:text-[#C5A059] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/about" className="hover:text-[#C5A059] transition-colors">
            About Us
          </Link>
        </nav>

        {/* Desktop Center: Search, Account, Cart Icons */}
        <div className="hidden xl:flex items-center gap-5">
          {/* Search Trigger */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search rings, necklaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-60 px-3.5 py-1.5 text-xs font-sans bg-white border border-[#C5A059] rounded-full focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[#111111]"
                  autoFocus
                />
                <button type="submit" className="text-[#111111] hover:text-[#C5A059] p-1.5" title="Search">
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-[#111111] p-1.5"
                  title="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[#111111] hover:text-[#C5A059] transition-colors p-2 flex items-center gap-1.5 min-h-[44px]"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
                <span className="text-xs font-sans uppercase tracking-wider text-[#555555]">
                  Search
                </span>
              </button>
            )}
          </div>

          {/* User Profile / Auth Trigger */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              className="text-[#111111] hover:text-[#C5A059] transition-colors p-2 flex items-center gap-1.5 min-h-[44px]"
              title={user ? `Signed in as ${user.full_name || 'Customer'}` : 'Sign In'}
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="text-xs font-serif font-medium text-[#111111] max-w-[90px] truncate">
                  {user.full_name?.split(' ')[0] || 'Account'}
                </span>
              )}
            </button>

            {/* Signed-in Dropdown Menu */}
            {user && isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EADFC9] rounded-2xl shadow-xl p-3 space-y-2 z-50 text-xs font-sans animate-in fade-in duration-150">
                <div className="border-b border-[#F4EAD3] pb-2 px-2">
                  <p className="font-serif font-semibold text-sm text-[#111111] truncate">{user.full_name || 'Privileged Member'}</p>
                  <p className="text-[10px] text-[#C5A059] font-medium">{user.loyalty_points} Jewel Points Available</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C5A059]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#C5A059]" />
                  <span>My Orders</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/products"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setIsUserMenuOpen(false);
                    showToast('Signed Out', 'You have been signed out.', 'info');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon Trigger */}
          <button
            onClick={openCart}
            className="relative text-[#111111] hover:text-[#C5A059] transition-colors p-2 min-h-[44px] flex items-center"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-0 bg-[#C5A059] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Right: Brand Logo */}
        <div className="hidden xl:block text-right">
          <Link href="/" className="inline-block group text-right">
            <h1 className="text-2xl 2xl:text-3xl font-serif tracking-tight text-[#111111] group-hover:text-[#C5A059] transition-colors leading-none">
              FOREVERE
            </h1>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-sans mt-0.5">
              JEWELLERY
            </span>
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MOBILE & TABLET LAYOUT (< xl: under 1280px)
            - Left: Hamburger button (opens slide-in drawer)
            - Center: Brand Logo (FOREVERE + JEWELLERY)
            - Right: Search, Account, Cart icons
            ══════════════════════════════════════════════════════════ */}

        {/* Mobile Left: Hamburger Menu Trigger */}
        <div className="xl:hidden flex items-center">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="text-[#111111] hover:text-[#C5A059] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Center: Brand Logo */}
        <div className="xl:hidden text-center flex-1">
          <Link href="/" className="inline-block group text-center">
            <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-[#111111] group-hover:text-[#C5A059] transition-colors leading-none">
              FOREVERE
            </h1>
            <span className="block text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-sans mt-0.5">
              JEWELLERY
            </span>
          </Link>
        </div>

        {/* Mobile Right: Search, User, Cart Icons */}
        <div className="xl:hidden flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-[#111111] hover:text-[#C5A059] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile User Button */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              className="text-[#111111] hover:text-[#C5A059] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              title={user ? `Signed in as ${user.full_name || 'Customer'}` : 'Sign In'}
              aria-label="User Account"
            >
              <User className="w-5 h-5" />
            </button>

            {user && isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#EADFC9] rounded-2xl shadow-xl p-3 space-y-2 z-50 text-xs font-sans animate-in fade-in duration-150">
                <div className="border-b border-[#F4EAD3] pb-2 px-2">
                  <p className="font-serif font-semibold text-sm text-[#111111] truncate">{user.full_name || 'Privileged Member'}</p>
                  <p className="text-[10px] text-[#C5A059] font-medium">{user.loyalty_points} Jewel Points</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C5A059]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#C5A059]" />
                  <span>My Orders</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/products"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setIsUserMenuOpen(false);
                    showToast('Signed Out', 'You have been signed out.', 'info');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Cart Button */}
          <button
            onClick={openCart}
            className="relative text-[#111111] hover:text-[#C5A059] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1 bg-[#C5A059] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* ─── MOBILE SEARCH EXPAND BAR ─── */}
      {isSearchOpen && (
        <div className="xl:hidden bg-[#FDFBF7] border-t border-[#EADFC9] px-4 py-3 animate-in slide-in-from-top-1 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Search rings, necklaces, earrings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-base sm:text-xs font-sans bg-white border border-[#C5A059] rounded-full focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[#111111]"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#111111] text-[#C5A059] rounded-full"
              aria-label="Search submit"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-[#111111]"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ─── MOBILE & TABLET SLIDE-IN DRAWER ─── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 xl:hidden ${
          isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileDrawerOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer container */}
        <div
          className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#FDFBF7] border-r border-[#EADFC9] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out z-10 ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#EADFC9] flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="inline-block group"
            >
              <h2 className="text-xl font-serif tracking-tight text-[#111111] group-hover:text-[#C5A059] transition-colors leading-none">
                FOREVERE
              </h2>
              <span className="block text-[8px] uppercase tracking-[0.3em] text-[#C5A059] font-sans mt-0.5">
                JEWELLERY
              </span>
            </Link>

            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-[#111111] rounded-full hover:bg-black/5 transition-colors focus:outline-none"
              aria-label="Close Navigation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Search + Nav Links */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Drawer Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-base sm:text-xs font-sans bg-white border border-[#EADFC9] rounded-xl focus:outline-none focus:border-[#C5A059] text-[#111111]"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2 p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-500 hover:text-[#C5A059]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Navigation Links */}
            <nav className="flex flex-col text-xs font-sans uppercase tracking-widest text-[#111111]">
              <Link
                href="/shop"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="py-3 border-b border-[#F4EAD3] font-semibold text-[#C5A059] min-h-[44px] flex items-center"
              >
                All Jewelry
              </Link>
              {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="py-3 border-b border-[#F4EAD3] hover:text-[#C5A059] min-h-[44px] flex items-center transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="py-3 border-b border-[#F4EAD3] hover:text-[#C5A059] min-h-[44px] flex items-center transition-colors"
              >
                About Us
              </Link>
            </nav>

            {/* Account Quick Links in Drawer */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#C5A059] font-semibold block">
                Account &amp; Services
              </span>
              {user ? (
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 text-xs text-[#111111] hover:text-[#C5A059] min-h-[44px]"
                  >
                    <User className="w-4 h-4 text-[#C5A059]" />
                    <span>My Profile ({user.full_name?.split(' ')[0] || 'Account'})</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 text-xs text-[#111111] hover:text-[#C5A059] min-h-[44px]"
                  >
                    <Package className="w-4 h-4 text-[#C5A059]" />
                    <span>Order History &amp; Tracking</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/products"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 text-xs text-emerald-700 font-medium min-h-[44px]"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMobileDrawerOpen(false);
                      showToast('Signed Out', 'You have been signed out.', 'info');
                    }}
                    className="w-full flex items-center gap-2.5 py-2.5 text-xs text-rose-600 hover:text-rose-700 min-h-[44px] text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full mt-2 py-3 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full min-h-[44px] flex items-center justify-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Privilege Club</span>
                </button>
              )}
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-[#EADFC9] bg-[#F8F3E6]/60 text-[11px] font-sans text-gray-500 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Complimentary Insured Shipping</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Handcrafted fine luxury jewelry made with ethical gold &amp; certified diamonds.
            </p>
          </div>

        </div>
      </div>

    </header>
  );
}
