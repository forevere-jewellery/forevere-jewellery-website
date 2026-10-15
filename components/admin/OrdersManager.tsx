'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import { ShoppingBag, Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, Search } from 'lucide-react';

const ORDER_STATUSES = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export function OrdersManager() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    mockDB.loadFromLocalStorage();
    setOrders([...mockDB.orders]);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    mockDB.orders = mockDB.orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    );
    mockDB.saveToLocalStorage();
    loadOrders();
    showToast('Order Updated', `Order status changed to ${newStatus}.`, 'success');
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border';
    switch (status) {
      case 'placed': return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      case 'processing': return `${base} bg-amber-50 text-amber-700 border-amber-200`;
      case 'shipped': return `${base} bg-purple-50 text-purple-700 border-purple-200`;
      case 'out_for_delivery': return `${base} bg-orange-50 text-orange-700 border-orange-200`;
      case 'delivered': return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
      case 'cancelled': return `${base} bg-rose-50 text-rose-700 border-rose-200`;
      default: return `${base} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order Fulfillment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#111111]">Orders Management</h1>
        <div className="flex items-center gap-4 text-xs font-sans text-gray-500">
          <span>{orders.length} total orders</span>
          <span>&bull;</span>
          <span>₹{totalRevenue.toLocaleString('en-IN')} total revenue</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs font-sans text-[#111111] focus:outline-none focus:border-[#C5A059]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs font-sans text-[#111111] focus:outline-none focus:border-[#C5A059]"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((order) => (
          <div key={order.id} className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-[#111111]">{order.id}</span>
                    <span className={getStatusBadge(order.status)}>
                      {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                    {new Date(order.created_at).toLocaleString()} &bull; {order.payment_method}
                    {order.is_gift && ' 🎁'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-serif font-bold text-sm text-[#111111]">₹{order.total.toLocaleString('en-IN')}</p>
                <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto mt-1 transition-transform ${expandedId === order.id ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {expandedId === order.id && (
              <div className="border-t border-[#EADFC9] p-5 space-y-4 animate-in fade-in">
                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2 text-xs font-sans">
                    <h4 className="font-semibold text-gray-600 uppercase tracking-wider text-[10px]">Items</h4>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-[#111111]">{item.product_name_snapshot} × {item.quantity}</span>
                        <span className="font-serif font-bold text-[#111111]">₹{(item.price_snapshot * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#F4EAD3] pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="font-serif">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex items-center gap-3 text-xs font-sans border-t border-[#F4EAD3] pt-3">
                  <label className="font-semibold text-gray-600 uppercase tracking-wider text-[10px] shrink-0">Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                {/* Shipping address */}
                {order.shipping_address && (
                  <div className="text-[11px] text-gray-500 font-sans border-t border-[#F4EAD3] pt-3">
                    <span className="font-semibold text-gray-700">Ship to: </span>
                    {order.shipping_address.full_name}, {order.shipping_address.line1}, {order.shipping_address.city} — {order.shipping_address.pincode}
                  </div>
                )}

                {/* Gift note */}
                {order.is_gift && order.gift_message && (
                  <div className="text-[11px] text-[#C5A059] font-sans italic border-t border-[#F4EAD3] pt-2">
                    🎁 Gift message: "{order.gift_message}"
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white border border-[#EADFC9] rounded-3xl p-16 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-400 font-sans">No orders found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
