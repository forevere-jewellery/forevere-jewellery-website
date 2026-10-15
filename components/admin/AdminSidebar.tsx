'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gem,
  LayoutGrid,
  ShoppingBag,
  Tag,
  Gift,
  Home,
  BarChart3,
  LogOut,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { mockDB } from '@/lib/supabase/mock-db';

const NAV_ITEMS = [
  { name: 'Products', href: '/admin/products', icon: Gem },
  { name: 'Categories', href: '/admin/categories', icon: LayoutGrid },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
  { name: 'Loyalty Points', href: '/admin/points', icon: Gift },
  { name: 'Payment Methods', href: '/admin/payments', icon: CreditCard },
  { name: 'Homepage Content', href: '/admin/homepage', icon: Home },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide sidebar on /admin/login
  if (pathname === '/admin/login') return null;

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    mockDB.currentUser = null;
    mockDB.saveToLocalStorage();
    document.cookie = 'fj_role=; path=/; max-age=0';
    document.cookie = 'fj_user_id=; path=/; max-age=0';
    document.cookie = 'fj_admin_token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  const navLinks = (
    <nav className="space-y-1 text-xs font-sans">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[44px] ${
              isActive
                ? 'bg-[#C5A059] text-white font-semibold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ─── Mobile Header Bar (md:hidden) ─── */}
      <div className="md:hidden sticky top-0 z-40 bg-[#111111] text-white border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-sm tracking-wide text-white leading-none">FOREVERE</h2>
            <span className="text-[8px] font-sans uppercase tracking-widest text-[#C5A059]">
              Admin Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ─── Mobile Off-Canvas Drawer (md:hidden) ─── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#111111] text-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-200 z-10 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-sm tracking-wide text-white">FOREVERE</h2>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[#C5A059]">Admin</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white"
                aria-label="Close Admin Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navLinks}
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-2 text-xs font-sans">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2.5 text-gray-400 hover:text-[#C5A059] transition-colors rounded-lg hover:bg-gray-900 min-h-[44px]"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Desktop Persistent Sidebar (md:flex) ─── */}
      <aside className="hidden md:flex w-64 bg-[#111111] text-white flex-col justify-between border-r border-gray-800 min-h-screen shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base tracking-wide text-white">FOREVERE</h2>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#C5A059] block">
                Admin Portal
              </span>
            </div>
          </div>

          {/* Nav Links */}
          {navLinks}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 space-y-3 text-xs font-sans">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-gray-400 hover:text-[#C5A059] transition-colors rounded-lg hover:bg-gray-900"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>

      </aside>
    </>
  );
}
