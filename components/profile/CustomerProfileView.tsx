'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/supabase/mock-db';
import { createClient, isRealSupabaseConfigured } from '@/lib/supabase/client';
import { Order, Address, PointsLedgerEntry } from '@/types/database';
import {
  User,
  Package,
  MapPin,
  Gift,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Star,
  Copy,
  Share2,
  ArrowRight,
  Settings,
  ShoppingBag,
  Heart
} from 'lucide-react';

type ProfileTab = 'orders' | 'addresses' | 'loyalty' | 'referral';

export function CustomerProfileView() {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pointsLedger, setPointsLedger] = useState<PointsLedgerEntry[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Address form
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    if (isRealSupabaseConfigured()) {
      try {
        const supabase = createClient();

        // 1. Fetch real addresses
        const { data: dbAddrs } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (dbAddrs) setAddresses(dbAddrs);

        // 2. Fetch real orders with order items
        const { data: dbOrders } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dbOrders) setOrders(dbOrders);

        // 3. Fetch real points ledger
        const { data: dbPoints } = await supabase
          .from('points_ledger')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dbPoints) setPointsLedger(dbPoints);
        return;
      } catch (err) {
        console.warn('[CustomerProfileView] Failed to load data from Supabase, falling back to local store:', err);
      }
    }

    // Local storage fallback
    mockDB.loadFromLocalStorage();
    setOrders(mockDB.orders.filter((o) => o.user_id === user.id));
    setAddresses(mockDB.addresses.filter((a) => a.user_id === user.id));
    setPointsLedger(mockDB.pointsLedger.filter((p) => p.user_id === user.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'out_for_delivery': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = steps.indexOf(status);
    return steps.map((step, idx) => ({
      name: step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      completed: idx <= currentIdx,
      current: idx === currentIdx
    }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isRealSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            label: 'Delivery Address',
            full_name: addrName.trim(),
            phone: addrPhone.trim(),
            line1: addrLine1.trim(),
            city: addrCity.trim(),
            state: addrState.trim(),
            pincode: addrPincode.trim(),
            is_default: addresses.length === 0,
          })
          .select()
          .single();

        if (!error && data) {
          setIsAddingAddr(false);
          setAddrName(''); setAddrPhone(''); setAddrLine1(''); setAddrCity(''); setAddrState(''); setAddrPincode('');
          await loadData();
          showToast('Address Saved', 'New delivery address added.', 'success');
          return;
        }
      } catch (err) {
        console.warn('[CustomerProfileView] Failed saving address to Supabase:', err);
      }
    }

    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      user_id: user.id,
      label: 'Delivery Address',
      full_name: addrName.trim(),
      phone: addrPhone.trim(),
      line1: addrLine1.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      is_default: addresses.length === 0,
      created_at: new Date().toISOString()
    };
    mockDB.addresses.push(newAddr);
    mockDB.saveToLocalStorage();
    setIsAddingAddr(false);
    setAddrName(''); setAddrPhone(''); setAddrLine1(''); setAddrCity(''); setAddrState(''); setAddrPincode('');
    loadData();
    showToast('Address Saved', 'New delivery address added.', 'success');
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('addresses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('[CustomerProfileView] Failed deleting address from Supabase:', err);
      }
    }

    mockDB.addresses = mockDB.addresses.filter((a) => a.id !== id);
    mockDB.saveToLocalStorage();
    loadData();
    showToast('Address Removed', 'Delivery address deleted.', 'info');
  };

  const copyReferralCode = () => {
    const code = user?.referral_code || 'FOREVERE-REF';
    navigator.clipboard.writeText(code).catch(() => {});
    showToast('Copied', 'Referral code copied to clipboard.', 'success');
  };

  if (!user) return null;

  const TABS: { key: ProfileTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" />, count: orders.length },
    { key: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" />, count: addresses.length },
    { key: 'loyalty', label: 'Jewel Points', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'referral', label: 'Refer & Earn', icon: <Share2 className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#F8F3E6] border-2 border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-serif text-[#111111]">{user.full_name || 'Valued Customer'}</h1>
          <p className="text-xs text-gray-500 font-sans">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs font-sans bg-[#F8F3E6] text-[#C5A059] px-3 py-1 rounded-full font-semibold border border-[#EADFC9]">
              <Sparkles className="w-3 h-3 inline mr-1" />{user.loyalty_points} Jewel Points
            </span>
            <span className="text-xs font-sans text-gray-500">{orders.length} orders placed</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-white border border-[#EADFC9] rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-[#111111] text-[#C5A059] shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-gray-200'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════ ORDERS TAB ═══════ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
                {/* Order Summary Row */}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#111111]">{order.id}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'shipped' && <Truck className="w-3 h-3" />}
                          {order.status === 'placed' && <Clock className="w-3 h-3" />}
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()} &bull; {order.items?.length || 0} items
                        {order.is_gift && <> &bull; <Gift className="w-3 h-3 inline text-[#C5A059]" /> Gift Order</>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif font-bold text-sm text-[#111111]">₹{order.total.toLocaleString('en-IN')}</p>
                    <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto mt-1 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded: Item Details + Tracking */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-[#EADFC9] p-5 space-y-5 animate-in fade-in">
                    {/* Items */}
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs font-sans">
                          <div>
                            <p className="font-serif font-semibold text-[#111111]">{item.product_name_snapshot}</p>
                            <p className="text-gray-400 text-[10px]">Qty: {item.quantity} × ₹{item.price_snapshot.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="font-serif font-bold text-[#111111]">₹{(item.price_snapshot * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Tracking Timeline */}
                    <div className="border-t border-[#F4EAD3] pt-4">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-sans font-semibold mb-3">Delivery Tracking</h4>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex items-center gap-1 min-w-[320px]">
                          {getTrackingSteps(order.status).map((step, idx) => (
                            <React.Fragment key={step.name}>
                              <div className="flex flex-col items-center gap-1 text-center shrink-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  step.completed ? 'bg-[#C5A059] text-white' : 'bg-gray-200 text-gray-400'
                                } ${step.current ? 'ring-2 ring-[#C5A059]/30 ring-offset-2' : ''}`}>
                                  {step.completed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                                </div>
                                <span className={`text-[9px] font-sans whitespace-nowrap ${step.completed ? 'text-[#111111] font-semibold' : 'text-gray-400'}`}>
                                  {step.name}
                                </span>
                              </div>
                              {idx < 4 && (
                                <div className={`flex-1 h-0.5 min-w-[20px] ${step.completed ? 'bg-[#C5A059]' : 'bg-gray-200'}`} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gift Message */}
                    {order.is_gift && order.gift_message && (
                      <div className="p-3 bg-[#F8F3E6] border border-[#EADFC9] rounded-xl flex items-start gap-2 text-xs font-sans">
                        <Gift className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111111]">Gift Message</p>
                          <p className="text-gray-600 italic">&ldquo;{order.gift_message}&rdquo;</p>
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="text-[11px] font-sans text-gray-500">
                        <span className="font-semibold text-gray-700">Ship to: </span>
                        {order.shipping_address.full_name}, {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg text-[#111111]">No orders yet</h3>
              <p className="text-xs text-gray-500 font-sans">Your luxury jewelry orders will appear here.</p>
              <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#111111] text-white hover:bg-[#C5A059] rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-colors">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ═══════ ADDRESSES TAB ═══════ */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingAddr(!isAddingAddr)}
              className="px-5 py-2.5 min-h-[44px] bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingAddr ? 'Cancel' : 'Add New Address'}</span>
            </button>
          </div>

          {isAddingAddr && (
            <form onSubmit={handleSaveAddress} className="bg-white border border-[#EADFC9] rounded-2xl p-6 space-y-4 text-xs font-sans shadow-sm animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Full Name *</label>
                  <input type="text" required value={addrName} onChange={(e) => setAddrName(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Phone *</label>
                  <input type="tel" required value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Address *</label>
                <input type="text" required value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">City *</label>
                  <input type="text" required value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">State *</label>
                  <input type="text" required value={addrState} onChange={(e) => setAddrState(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Pincode *</label>
                  <input type="text" required value={addrPincode} onChange={(e) => setAddrPincode(e.target.value)} className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]" />
                </div>
              </div>
              <button type="submit" className="px-6 py-2.5 min-h-[44px] bg-[#111111] hover:bg-[#C5A059] text-white rounded-full font-semibold transition-colors">Save Address</button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white border border-[#EADFC9] rounded-2xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C5A059]" />
                    <span className="font-serif font-semibold text-sm text-[#111111]">{addr.full_name}</span>
                  </div>
                  {addr.is_default && (
                    <span className="text-[10px] bg-[#F8F3E6] text-[#C5A059] px-2 py-0.5 rounded font-semibold">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 font-sans">{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                <p className="text-[11px] text-gray-400 font-sans">Phone: {addr.phone}</p>
                <button onClick={() => deleteAddress(addr.id)} className="text-[11px] text-rose-500 hover:underline font-sans mt-1">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ LOYALTY POINTS TAB ═══════ */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-xs font-sans uppercase tracking-wider text-gray-500">Your Balance</p>
            <p className="text-4xl font-serif font-bold text-[#111111]">{user.loyalty_points}</p>
            <p className="text-xs text-[#C5A059] font-sans font-semibold">{mockDB.pointsSettings.point_name_plural}</p>
          </div>

          {/* Conversion rules display */}
          <div className="bg-white border border-[#EADFC9] rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="font-serif font-semibold text-sm text-[#111111]">Redeem Points for Store Credit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mockDB.pointsSettings.point_to_coupon_conversion_rules.map((rule, idx) => (
                <div key={idx} className="bg-[#F8F3E6] border border-[#EADFC9] rounded-xl p-4 text-center space-y-1">
                  <p className="font-serif font-bold text-lg text-[#C5A059]">{rule.points} pts</p>
                  <p className="text-[10px] text-gray-500 font-sans">→</p>
                  <p className="font-serif font-bold text-lg text-[#111111]">₹{rule.discount_amount}</p>
                  <p className="text-[10px] text-gray-500 font-sans">Store Credit</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          {pointsLedger.length > 0 && (
            <div className="bg-white border border-[#EADFC9] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F4EAD3]">
                <h3 className="font-serif font-semibold text-sm text-[#111111]">Points Activity</h3>
              </div>
              <div className="divide-y divide-[#F4EAD3]">
                {pointsLedger.map((entry) => (
                  <div key={entry.id} className="px-6 py-3 flex items-center justify-between text-xs font-sans">
                    <div>
                      <p className="text-[#111111]">{entry.reason}</p>
                      <p className="text-[10px] text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-serif font-bold ${entry.points > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {entry.points > 0 ? '+' : ''}{entry.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ REFERRAL TAB ═══════ */}
      {activeTab === 'referral' && (
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center mx-auto">
              <Share2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif text-[#111111]">Refer Friends, Earn Rewards</h2>
            <p className="text-xs text-gray-500 font-sans max-w-md mx-auto">
              Share your unique referral code. When your friend makes their first purchase, you both earn bonus Jewel Points!
            </p>
          </div>

          <div className="bg-[#F8F3E6] border border-[#EADFC9] rounded-2xl p-6 text-center space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-sans">Your Referral Code</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#111111] bg-white px-4 sm:px-6 py-3 rounded-xl border border-[#EADFC9] break-all">
                {user.referral_code || 'FOREVERE-' + user.id.slice(0, 6).toUpperCase()}
              </span>
              <button
                onClick={copyReferralCode}
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#111111] text-[#C5A059] rounded-xl hover:bg-[#C5A059] hover:text-white transition-colors"
                title="Copy Code"
                aria-label="Copy Referral Code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-emerald-800 font-semibold">You Earn</p>
              <p className="font-serif font-bold text-xl text-emerald-700">50 Points</p>
              <p className="text-emerald-600 text-[10px]">Per successful referral</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-blue-800 font-semibold">Friend Gets</p>
              <p className="font-serif font-bold text-xl text-blue-700">25 Points</p>
              <p className="text-blue-600 text-[10px]">Welcome bonus on first order</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
