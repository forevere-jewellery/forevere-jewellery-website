'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, SpendDiscountTier, Offer } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  TrendingUp,
  Megaphone,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

type ActiveTab = 'coupons' | 'spend_tiers' | 'offers';

export function CouponOfferManager() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('coupons');

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [cpCode, setCpCode] = useState('');
  const [cpDiscountType, setCpDiscountType] = useState<'percent' | 'flat'>('percent');
  const [cpDiscountValue, setCpDiscountValue] = useState('');
  const [cpMinOrder, setCpMinOrder] = useState('');
  const [cpMaxUses, setCpMaxUses] = useState('');

  // Spend Tiers State
  const [spendTiers, setSpendTiers] = useState<SpendDiscountTier[]>([]);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SpendDiscountTier | null>(null);
  const [tierMinSpend, setTierMinSpend] = useState('');
  const [tierDiscount, setTierDiscount] = useState('');

  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerBank, setOfferBank] = useState('');
  const [offerDetail, setOfferDetail] = useState('');
  const [offerImage, setOfferImage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    mockDB.loadFromLocalStorage();
    setCoupons([...mockDB.coupons]);
    setSpendTiers([...mockDB.spendTiers]);
    setOffers([...mockDB.offers]);
  };

  // ────── COUPONS ──────
  const openCouponModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCpCode(coupon.code);
      setCpDiscountType(coupon.discount_percent ? 'percent' : 'flat');
      setCpDiscountValue(String(coupon.discount_percent || coupon.discount_amount || ''));
      setCpMinOrder(String(coupon.min_order_value));
      setCpMaxUses(String(coupon.max_uses));
    } else {
      setEditingCoupon(null);
      setCpCode('');
      setCpDiscountType('percent');
      setCpDiscountValue('');
      setCpMinOrder('');
      setCpMaxUses('');
    }
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = cpCode.trim().toUpperCase();
    if (!code || !cpDiscountValue) return;

    if (editingCoupon) {
      mockDB.coupons = mockDB.coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code,
              discount_percent: cpDiscountType === 'percent' ? parseFloat(cpDiscountValue) : null,
              discount_amount: cpDiscountType === 'flat' ? parseFloat(cpDiscountValue) : null,
              min_order_value: parseFloat(cpMinOrder) || 0,
              max_uses: parseInt(cpMaxUses) || 9999
            }
          : c
      );
    } else {
      const newCoupon: Coupon = {
        id: 'cp-' + Date.now(),
        code,
        discount_percent: cpDiscountType === 'percent' ? parseFloat(cpDiscountValue) : null,
        discount_amount: cpDiscountType === 'flat' ? parseFloat(cpDiscountValue) : null,
        min_order_value: parseFloat(cpMinOrder) || 0,
        max_uses: parseInt(cpMaxUses) || 9999,
        times_used: 0,
        active: true
      };
      mockDB.coupons.push(newCoupon);
    }

    mockDB.saveToLocalStorage();
    setIsCouponModalOpen(false);
    loadData();
    showToast('Coupon Saved', `Coupon code "${code}" saved.`, 'success');
  };

  const toggleCouponActive = (id: string) => {
    mockDB.coupons = mockDB.coupons.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    mockDB.saveToLocalStorage();
    loadData();
  };

  const deleteCoupon = (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return;
    mockDB.coupons = mockDB.coupons.filter((c) => c.id !== id);
    mockDB.saveToLocalStorage();
    loadData();
    showToast('Coupon Deleted', 'Coupon code removed.', 'info');
  };

  // ────── SPEND TIERS ──────
  const openTierModal = (tier?: SpendDiscountTier) => {
    if (tier) {
      setEditingTier(tier);
      setTierMinSpend(String(tier.min_spend));
      setTierDiscount(String(tier.discount_percent));
    } else {
      setEditingTier(null);
      setTierMinSpend('');
      setTierDiscount('');
    }
    setIsTierModalOpen(true);
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierMinSpend || !tierDiscount) return;

    if (editingTier) {
      mockDB.spendTiers = mockDB.spendTiers.map((t) =>
        t.id === editingTier.id
          ? { ...t, min_spend: parseFloat(tierMinSpend), discount_percent: parseFloat(tierDiscount) }
          : t
      );
    } else {
      mockDB.spendTiers.push({
        id: 'st-' + Date.now(),
        min_spend: parseFloat(tierMinSpend),
        discount_percent: parseFloat(tierDiscount)
      });
    }

    mockDB.spendTiers.sort((a, b) => a.min_spend - b.min_spend);
    mockDB.saveToLocalStorage();
    setIsTierModalOpen(false);
    loadData();
    showToast('Spend Tier Saved', 'Automatic discount tier updated.', 'success');
  };

  const deleteTier = (id: string) => {
    if (!confirm('Delete this spend tier?')) return;
    mockDB.spendTiers = mockDB.spendTiers.filter((t) => t.id !== id);
    mockDB.saveToLocalStorage();
    loadData();
    showToast('Tier Removed', 'Spend discount tier deleted.', 'info');
  };

  // ────── OFFERS ──────
  const openOfferModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferTitle(offer.title);
      setOfferDesc(offer.description || '');
      setOfferBank(offer.bank_or_payment_method || '');
      setOfferDetail(offer.discount_detail || '');
      setOfferImage(offer.image_url || '');
    } else {
      setEditingOffer(null);
      setOfferTitle('');
      setOfferDesc('');
      setOfferBank('');
      setOfferDetail('');
      setOfferImage('');
    }
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) return;

    if (editingOffer) {
      mockDB.offers = mockDB.offers.map((o) =>
        o.id === editingOffer.id
          ? {
              ...o,
              title: offerTitle.trim(),
              description: offerDesc.trim() || null,
              bank_or_payment_method: offerBank.trim() || null,
              discount_detail: offerDetail.trim() || null,
              image_url: offerImage.trim() || null
            }
          : o
      );
    } else {
      mockDB.offers.push({
        id: 'off-' + Date.now(),
        title: offerTitle.trim(),
        description: offerDesc.trim() || null,
        bank_or_payment_method: offerBank.trim() || null,
        discount_detail: offerDetail.trim() || null,
        image_url: offerImage.trim() || null,
        active: true,
        sort_order: mockDB.offers.length + 1
      });
    }

    mockDB.saveToLocalStorage();
    setIsOfferModalOpen(false);
    loadData();
    showToast('Offer Saved', `Bank/Payment offer "${offerTitle}" saved.`, 'success');
  };

  const toggleOfferActive = (id: string) => {
    mockDB.offers = mockDB.offers.map((o) =>
      o.id === id ? { ...o, active: !o.active } : o
    );
    mockDB.saveToLocalStorage();
    loadData();
  };

  const deleteOffer = (id: string) => {
    if (!confirm('Delete this offer permanently?')) return;
    mockDB.offers = mockDB.offers.filter((o) => o.id !== id);
    mockDB.saveToLocalStorage();
    loadData();
    showToast('Offer Deleted', 'Bank/payment offer removed.', 'info');
  };

  const TABS: { key: ActiveTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'coupons', label: 'Coupon Codes', icon: <Tag className="w-4 h-4" />, count: coupons.length },
    { key: 'spend_tiers', label: 'Spend Tiers', icon: <TrendingUp className="w-4 h-4" />, count: spendTiers.length },
    { key: 'offers', label: 'Bank & Payment Offers', icon: <Megaphone className="w-4 h-4" />, count: offers.length }
  ];

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5" />
          <span>Revenue Promotion Engine</span>
        </div>
        <h1 className="text-3xl font-serif text-[#111111]">Discounts, Coupons &amp; Offers</h1>
        <p className="text-xs text-gray-500 font-sans">
          Manage promotional coupon codes, automatic spend-based reward tiers, and bank/payment partnership offers displayed on the storefront.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-white border border-[#EADFC9] rounded-2xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#111111] text-[#C5A059] shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-gray-200 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══════ TAB: COUPON CODES ═══════ */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openCouponModal()}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="bg-white border border-[#EADFC9] rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-[#FDFBF7] text-gray-500 border-b border-[#EADFC9]">
                  <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-4 font-semibold uppercase tracking-wider">Discount</th>
                  <th className="text-left px-4 py-4 font-semibold uppercase tracking-wider">Min Order</th>
                  <th className="text-center px-4 py-4 font-semibold uppercase tracking-wider">Usage</th>
                  <th className="text-center px-4 py-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EAD3]">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sm text-[#111111] bg-[#F8F3E6] px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#111111]">
                      {coupon.discount_percent
                        ? <span className="flex items-center gap-1"><Percent className="w-3 h-3 text-[#C5A059]" />{coupon.discount_percent}% Off</span>
                        : <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3 text-[#C5A059]" />₹{coupon.discount_amount} Flat</span>
                      }
                    </td>
                    <td className="px-4 py-4 text-gray-600">₹{coupon.min_order_value.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-center text-gray-600">{coupon.times_used} / {coupon.max_uses}</td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => toggleCouponActive(coupon.id)}>
                        {coupon.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-[10px] font-semibold border border-gray-200">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openCouponModal(coupon)} className="text-gray-400 hover:text-[#C5A059] p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCoupon(coupon.id)} className="text-gray-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════ TAB: SPEND TIERS ═══════ */}
      {activeTab === 'spend_tiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-sans max-w-lg">
              Automatic cart-level discount tiers. When a customer's subtotal reaches the minimum spend, the corresponding percentage discount is applied automatically at checkout.
            </p>
            <button
              onClick={() => openTierModal()}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans font-semibold flex items-center gap-2 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {spendTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white border border-[#EADFC9] rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openTierModal(tier)} className="text-gray-400 hover:text-[#C5A059] p-1">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTier(tier.id)} className="text-gray-400 hover:text-rose-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-sans">Minimum Spend</p>
                  <p className="font-serif font-bold text-lg text-[#111111]">₹{tier.min_spend.toLocaleString('en-IN')}</p>
                </div>
                <div className="border-t border-[#F4EAD3] pt-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-sans">Auto Discount</p>
                  <p className="font-serif font-bold text-2xl text-[#C5A059]">{tier.discount_percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ TAB: BANK & PAYMENT OFFERS ═══════ */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openOfferModal()}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Offer</span>
            </button>
          </div>

          <div className="bg-white border border-[#EADFC9] rounded-3xl shadow-sm overflow-hidden divide-y divide-[#F4EAD3]">
            {offers.map((offer) => (
              <div key={offer.id} className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {offer.image_url ? (
                    <img src={offer.image_url} alt={offer.title} className="w-14 h-14 rounded-xl object-cover border border-[#EADFC9] shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-serif font-semibold text-sm text-[#111111] truncate">{offer.title}</h3>
                    <p className="text-[11px] text-gray-500 font-sans truncate">{offer.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-sans">
                      {offer.bank_or_payment_method && (
                        <span className="bg-[#F8F3E6] text-[#C5A059] px-2 py-0.5 rounded font-semibold">
                          {offer.bank_or_payment_method}
                        </span>
                      )}
                      {offer.discount_detail && (
                        <span className="text-gray-600">{offer.discount_detail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleOfferActive(offer.id)}>
                    {offer.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-[10px] font-semibold border border-gray-200">
                        <XCircle className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </button>
                  <button onClick={() => openOfferModal(offer)} className="text-gray-400 hover:text-[#C5A059] p-1">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="text-gray-400 hover:text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {offers.length === 0 && (
              <div className="p-12 text-center text-xs text-gray-400 font-sans">No bank or payment offers created yet.</div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ COUPON MODAL ═══════ */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F4EAD3] pb-4">
              <h3 className="font-serif text-lg font-semibold text-[#111111]">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-[#111111] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111] font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Discount Type</label>
                  <select
                    value={cpDiscountType}
                    onChange={(e) => setCpDiscountType(e.target.value as 'percent' | 'flat')}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                    {cpDiscountType === 'percent' ? 'Discount %' : 'Discount ₹'} *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder={cpDiscountType === 'percent' ? '15' : '500'}
                    value={cpDiscountValue}
                    onChange={(e) => setCpDiscountValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Min Order Value (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    value={cpMinOrder}
                    onChange={(e) => setCpMinOrder(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Max Uses</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={cpMaxUses}
                    onChange={(e) => setCpMaxUses(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADFC9]">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full font-semibold flex items-center gap-2 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ SPEND TIER MODAL ═══════ */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F4EAD3] pb-4">
              <h3 className="font-serif text-lg font-semibold text-[#111111]">
                {editingTier ? 'Edit Spend Tier' : 'Add Spend Tier'}
              </h3>
              <button onClick={() => setIsTierModalOpen(false)} className="text-gray-400 hover:text-[#111111] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Minimum Spend (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="10000"
                  value={tierMinSpend}
                  onChange={(e) => setTierMinSpend(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Auto Discount Percentage *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="5"
                  value={tierDiscount}
                  onChange={(e) => setTierDiscount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADFC9]">
                <button type="button" onClick={() => setIsTierModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full font-semibold flex items-center gap-2 transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ OFFER MODAL ═══════ */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F4EAD3] pb-4">
              <h3 className="font-serif text-lg font-semibold text-[#111111]">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-gray-400 hover:text-[#111111] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank Special"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the offer..."
                  value={offerDesc}
                  onChange={(e) => setOfferDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Bank / Payment Method</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Credit Cards"
                    value={offerBank}
                    onChange={(e) => setOfferBank(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Discount Detail</label>
                  <input
                    type="text"
                    placeholder="e.g. 10% OFF up to ₹2,500"
                    value={offerDetail}
                    onChange={(e) => setOfferDetail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Offer Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={offerImage}
                  onChange={(e) => setOfferImage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-[#111111]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADFC9]">
                <button type="button" onClick={() => setIsOfferModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full font-semibold flex items-center gap-2 transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
