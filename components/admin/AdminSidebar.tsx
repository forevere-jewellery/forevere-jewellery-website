'use client';

import React from 'react';
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
  ShieldCheck
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

  // Hide sidebar on /admin/login
  if (pathname === '/admin/login') return null;

  const handleLogout = () => {
    mockDB.currentUser = null;
    mockDB.saveToLocalStorage();
    document.cookie = 'fj_role=; path=/; max-age=0';
    document.cookie = 'fj_user_id=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-[#111111] text-white flex flex-col justify-between border-r border-gray-800 min-h-screen shrink-0">
      
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
        <nav className="space-y-1 text-xs font-sans">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
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
  );
}
