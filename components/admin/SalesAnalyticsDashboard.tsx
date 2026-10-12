'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockDB } from '@/lib/supabase/mock-db';
import { Order } from '@/types/database';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Users,
  BarChart3,
  Package,
  Star,
  ArrowUpRight,
  Award
} from 'lucide-react';

const GOLD = '#C5A059';
const DARK = '#111111';
const PIE_COLORS = ['#C5A059', '#D4AF37', '#B8860B', '#DAA520', '#F4C542', '#A0784A'];

export function SalesAnalyticsDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    mockDB.loadFromLocalStorage();
    setOrders([...mockDB.orders]);
  }, []);

  // Revenue by day (last 14 days)
  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      map[key] = 0;
    }
    orders.forEach((o) => {
      const date = new Date(o.created_at);
      const key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (map[key] !== undefined) {
        map[key] += o.total;
      }
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: count
    }));
  }, [orders]);

  // Top selling products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; units: number }> = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        const key = item.product_name_snapshot;
        if (!map[key]) map[key] = { name: key, revenue: 0, units: 0 };
        map[key].revenue += item.price_snapshot * item.quantity;
        map[key].units += item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.payment_method] = (map[o.payment_method] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, value: count }));
  }, [orders]);

  // Summary metrics
  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItemsSold = orders.reduce((a, o) => a + (o.items?.reduce((b, i) => b + i.quantity, 0) || 0), 0);

  const METRICS = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <IndianRupee className="w-5 h-5" />, color: 'text-[#C5A059]', bg: 'bg-[#F8F3E6]' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Items Sold', value: totalItemsSold.toString(), icon: <Package className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Business Intelligence</span>
        </div>
        <h1 className="text-3xl font-serif text-[#111111]">Sales Analytics Dashboard</h1>
        <p className="text-xs text-gray-500 font-sans">
          Real-time insights derived from all {mockDB.orders.length} orders in the mock store database.
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white border border-[#EADFC9] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                {m.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-wider text-gray-500">{m.label}</p>
              <p className="font-serif font-bold text-xl text-[#111111]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#111111]">Revenue — Last 14 Days</h3>
        {revenueByDay.some((d) => d.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4EAD3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'var(--font-sans)', fill: '#999' }} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-sans)', fill: '#999' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #EADFC9', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-sans border-2 border-dashed border-[#EADFC9] rounded-2xl">
            <div className="text-center space-y-2">
              <BarChart3 className="w-8 h-8 mx-auto text-gray-300" />
              <p>Revenue data will appear here once orders are placed in the store.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status — Pie Chart */}
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111111]">Orders by Status</h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ordersByStatus.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADFC9', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400 font-sans">No order data yet.</div>
          )}
        </div>

        {/* Payment Method Breakdown — Bar */}
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#111111]">Payment Methods</h3>
          {paymentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paymentBreakdown} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4EAD3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'var(--font-sans)', fill: '#999' }} />
                <YAxis tick={{ fontSize: 10, fill: '#999' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADFC9', fontSize: 12 }} />
                <Bar dataKey="value" fill={GOLD} radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400 font-sans">No payment data yet.</div>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F4EAD3] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#C5A059]" />
          <h3 className="font-serif text-lg font-semibold text-[#111111]">Top Performing Products</h3>
        </div>
        <div className="divide-y divide-[#F4EAD3]">
          {topProducts.length > 0 ? (
            topProducts.map((prod, idx) => (
              <div key={prod.name} className="px-6 py-4 flex items-center gap-4 text-xs font-sans hover:bg-[#FDFBF7] transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold shrink-0 ${
                  idx === 0 ? 'bg-[#C5A059] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-[#111111] truncate">{prod.name}</p>
                  <p className="text-gray-400 text-[10px]">{prod.units} units sold</p>
                </div>
                <span className="font-serif font-bold text-sm text-[#111111]">₹{prod.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-gray-400 font-sans">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Product revenue data will appear here once orders are placed.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
