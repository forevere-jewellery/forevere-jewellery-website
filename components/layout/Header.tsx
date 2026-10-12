'use client';

import React, { useState } from 'react';
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

export function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, openAuthModal, logout } = useAuth();
  const { openCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleUserClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADFC9]/60">
      {/* Top Banner */}
      <div className="bg-[#111111] text-white text-[11px] font-sans py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#C5A059] animate-pulse" />
        <span className="tracking-widest uppercase">Complimentary Worldwide Express Shipping &amp; Luxury Gift Box</span>
        <Sparkles className="w-3 h-3 text-[#C5A059] animate-pulse hidden sm:inline" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger & Categories */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#111111] p-1 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-sans uppercase tracking-widest text-[#444444]">
            <Link href="/shop" className="hover:text-[#C5A059] transition-colors font-medium">
              All Jewelry
            </Link>
            {categories.slice(0, 5).map((cat) => (
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
        </div>

        {/* Center: Brand Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#111111] group-hover:text-[#C5A059] transition-colors">
              FOREVERE
            </h1>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-sans">
              JEWELLARY
            </span>
          </Link>
        </div>

        {/* Right: Search, User, Cart */}
        <div className="flex items-center gap-5">
          {/* Search Trigger */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search rings, necklaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-60 px-3 py-1.5 text-xs font-sans bg-white border border-[#C5A059] rounded-full focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[#111111]"
                  autoFocus
                />
                <button type="submit" className="text-[#111111] hover:text-[#C5A059] p-1">
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-[#111111] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[#111111] hover:text-[#C5A059] transition-colors p-1 flex items-center gap-1.5"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-sans uppercase tracking-wider text-[#555555]">
                  Search
                </span>
              </button>
            )}
          </div>

          {/* User Profile / Auth Trigger */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              className="text-[#111111] hover:text-[#C5A059] transition-colors p-1 flex items-center gap-1.5"
              title={user ? `Signed in as ${user.full_name || 'Customer'}` : 'Sign In'}
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="hidden md:inline text-xs font-serif font-medium text-[#111111] max-w-[90px] truncate">
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C5A059]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => { setIsUserMenuOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#111111] hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#C5A059]" />
                  <span>My Orders</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/products"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
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
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
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
            className="relative text-[#111111] hover:text-[#C5A059] transition-colors p-1"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-b border-[#EADFC9] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search jewelry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs font-sans bg-white border border-[#EADFC9] rounded-lg focus:outline-none focus:border-[#C5A059]"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col gap-3 text-xs font-sans uppercase tracking-widest text-[#111111] pt-2">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#F4EAD3] font-semibold text-[#C5A059]"
            >
              All Fine Jewelry
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#F4EAD3] hover:text-[#C5A059]"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 hover:text-[#C5A059]"
            >
              About Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
