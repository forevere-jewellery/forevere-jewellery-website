'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/supabase/mock-db';
import { processPayment } from '@/lib/payment/adapter';
import { Address, Coupon, SpendDiscountTier, PaymentMethod, Order } from '@/types/database';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Tag,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Banknote,
  Lock,
  ArrowRight,
  ArrowLeft,
  Truck,
  Sparkles,
  Check,
  Gift
} from 'lucide-react';

export function CheckoutWorkflow() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // Discount & Coupon states
  const [spendTiers, setSpendTiers] = useState<SpendDiscountTier[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Gifting option
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Credit / Debit Card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial Auth & Data Load
  useEffect(() => {
    if (!user) {
      openAuthModal('login');
    } else {
      mockDB.loadFromLocalStorage();
      setSpendTiers(mockDB.spendTiers || []);
      setPaymentMethods(mockDB.paymentMethods.filter((m) => m.enabled));

      // User addresses
      const userAddrs = mockDB.addresses.filter((a) => a.user_id === user.id);
      if (userAddrs.length > 0) {
        setAddresses(userAddrs);
        const def = userAddrs.find((a) => a.is_default) || userAddrs[0];
        setSelectedAddressId(def.id);
      } else {
        // Initialize default mock address if empty
        const sampleAddr: Address = {
          id: 'addr-' + Date.now(),
          user_id: user.id,
          label: 'Home',
          full_name: user.full_name || 'Elena Rostova',
          phone: user.phone || '+91 98765 43210',
          line1: 'Penthouse 4B, Emerald Luxury Heights',
          line2: 'Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400020',
          is_default: true,
          created_at: new Date().toISOString()
        };
        mockDB.addresses.push(sampleAddr);
        mockDB.saveToLocalStorage();
        setAddresses([sampleAddr]);
        setSelectedAddressId(sampleAddr.id);
      }
    }
  }, [user]);

  // Auto-calculated Tiered Spend Discount
  const autoTierDiscount = useMemo(() => {
    if (!spendTiers.length) return { percent: 0, amount: 0, tier: null };
    // Find highest qualifying tier
    const sorted = [...spendTiers].sort((a, b) => b.min_spend - a.min_spend);
    const qualifying = sorted.find((t) => subtotal >= t.min_spend);
    if (!qualifying) return { percent: 0, amount: 0, tier: null };

    const amount = (subtotal * qualifying.discount_percent) / 100;
    return {
      percent: qualifying.discount_percent,
      amount,
      tier: qualifying
    };
  }, [spendTiers, subtotal]);

  // Coupon Discount Calculation
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_amount) {
      return appliedCoupon.discount_amount;
    }
    if (appliedCoupon.discount_percent) {
      return (subtotal * appliedCoupon.discount_percent) / 100;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // Total discounts
  const totalDiscount = autoTierDiscount.amount + couponDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  // Address creation
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      user_id: user.id,
      label: 'Delivery Address',
      full_name: addrName.trim() || user.full_name || 'Customer',
      phone: addrPhone.trim() || user.phone || '+91 98765 43210',
      line1: addrLine1.trim(),
      line2: addrLine2.trim() || null,
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      is_default: addresses.length === 0,
      created_at: new Date().toISOString()
    };

    const updated = [...addresses, newAddr];
    setAddresses(updated);
    setSelectedAddressId(newAddr.id);
    mockDB.addresses.push(newAddr);
    mockDB.saveToLocalStorage();
    setIsAddingAddress(false);
    showToast('Address Saved', 'New delivery address added successfully.', 'success');
  };

  // Coupon Validation
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    mockDB.loadFromLocalStorage();
    const found = mockDB.coupons.find(
      (c) => c.code.toUpperCase() === code && c.active
    );

    if (!found) {
      setCouponError('Invalid coupon code. Try WELCOME10, FOREVERE20, or JEWEL500.');
      return;
    }

    if (found.min_order_value && subtotal < found.min_order_value) {
      setCouponError(`Coupon requires a minimum order value of ₹${found.min_order_value.toLocaleString('en-IN')}.`);
      return;
    }

    setAppliedCoupon(found);
    showToast('Coupon Applied', `Code "${found.code}" applied successfully.`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  // Process Order & Payment
  const handleCompleteOrder = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const shippingAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!shippingAddress) {
      showToast('Shipping Required', 'Please select or add a delivery address.', 'warning');
      setStep(1);
      return;
    }

    setIsProcessing(true);

    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Call payment adapter
    const paymentResult = await processPayment({
      orderId,
      amount: finalTotal,
      currency: 'INR',
      paymentMethod: selectedPaymentMethod,
      customer: {
        name: shippingAddress.full_name,
        phone: shippingAddress.phone
      }
    });

    if (paymentResult.success) {
      // 1. Create Order Record
      const newOrder: Order = {
        id: orderId,
        user_id: user.id,
        status: 'placed',
        subtotal,
        discount_amount: totalDiscount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        shipping_address_id: shippingAddress.id,
        shipping_address: shippingAddress,
        payment_method: selectedPaymentMethod,
        payment_status: 'paid',
        total: finalTotal,
        gift_message: isGift ? giftMessage : null,
        is_gift: isGift,
        created_at: new Date().toISOString(),
        items: cartItems.map((item) => {
          const prod = item.product || mockDB.products.find((p) => p.id === item.product_id);
          const priceSnapshot = prod?.discount_percent && prod.discount_percent > 0
            ? prod.price * (1 - prod.discount_percent / 100)
            : prod?.price || 0;
          return {
            id: 'oi-' + Math.random().toString(36).substr(2, 7),
            order_id: orderId,
            product_id: item.product_id,
            product_name_snapshot: prod?.name || 'Fine Jewelry Piece',
            price_snapshot: priceSnapshot,
            quantity: item.quantity
          };
        })
      };

      mockDB.orders.unshift(newOrder);

      // 2. Decrement Stock Quantities
      cartItems.forEach((item) => {
        const prod = mockDB.products.find((p) => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
          prod.updated_at = new Date().toISOString();
        }
      });

      // 3. Increment Coupon usage if applied
      if (appliedCoupon) {
        const coupon = mockDB.coupons.find((c) => c.id === appliedCoupon.id);
        if (coupon) {
          coupon.times_used += 1;
        }
      }

      // 4. Award Loyalty Points
      const pointsRate = mockDB.pointsSettings.points_per_currency_unit || 0.05;
      const earnedPoints = Math.floor(finalTotal * pointsRate);
      if (earnedPoints > 0) {
        user.loyalty_points += earnedPoints;
        mockDB.pointsLedger.unshift({
          id: 'pl-' + Date.now(),
          user_id: user.id,
          points: earnedPoints,
          reason: `Earned on Order #${orderId}`,
          order_id: orderId,
          created_at: new Date().toISOString()
        });
      }

      // 5. Clear Cart
      clearCart();
      mockDB.saveToLocalStorage();

      setIsProcessing(false);
      showToast('Order Confirmed', `Order #${orderId} placed successfully!`, 'success');
      router.push(`/order-confirmation/${orderId}`);
    } else {
      setIsProcessing(false);
      showToast('Payment Failed', paymentResult.error || 'Payment could not be completed.', 'warning');
    }
  };

  const getMethodIcon = (name: string) => {
    if (name.includes('UPI')) return <QrCode className="w-5 h-5" />;
    if (name.includes('Net Banking')) return <Building2 className="w-5 h-5" />;
    if (name.includes('Wallet')) return <Wallet className="w-5 h-5" />;
    if (name.includes('COD') || name.includes('Cash')) return <Banknote className="w-5 h-5" />;
    return <CreditCard className="w-5 h-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Checkout Progress Stepper */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-sans">
          
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 font-semibold ${
              step >= 1 ? 'text-[#111111]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif ${
                step >= 1 ? 'bg-[#111111] text-[#C5A059]' : 'bg-gray-100 text-gray-400'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Shipping Address</span>
          </button>

          <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-[#C5A059]' : 'bg-gray-200'}`} />

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 font-semibold ${
              step >= 2 ? 'text-[#111111]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif ${
                step >= 2 ? 'bg-[#111111] text-[#C5A059]' : 'bg-gray-100 text-gray-400'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Review &amp; Discounts</span>
          </button>

          <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-[#C5A059]' : 'bg-gray-200'}`} />

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 font-semibold ${
              step >= 3 ? 'text-[#111111]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif ${
                step >= 3 ? 'bg-[#111111] text-[#C5A059]' : 'bg-gray-100 text-gray-400'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Payment &amp; Confirm</span>
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Multi-Step Interactive Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#F4EAD3] pb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A059]" />
                  <h2 className="font-serif text-xl font-semibold text-[#111111]">
                    Select Delivery Address
                  </h2>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-xs font-sans font-semibold text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingAddress ? (
                /* Add New Address Form */
                <form onSubmit={handleSaveNewAddress} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                        Full Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Elena Rostova"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Apartment, building, street name"
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">State *</label>
                      <input
                        type="text"
                        required
                        placeholder="Maharashtra"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="400020"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-[#111111]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full font-semibold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                /* Address Radio Cards */
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        selectedAddressId === addr.id
                          ? 'border-[#C5A059] bg-[#F8F3E6]/40 shadow-sm'
                          : 'border-[#EADFC9] hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-1 text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#111111]">{addr.full_name}</span>
                          <span className="text-[10px] bg-white border border-[#EADFC9] px-2 py-0.5 rounded text-gray-600 font-medium">
                            {addr.label || 'Home'}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-gray-500 font-mono text-[11px] pt-1">Phone: {addr.phone}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedAddressId === addr.id
                            ? 'border-[#C5A059] bg-[#C5A059] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAddressId === addr.id && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Step Action */}
              <div className="pt-4 border-t border-[#EADFC9] flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow flex items-center gap-2 transition-colors"
                >
                  <span>Continue to Discounts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER REVIEW & COUPONS */}
          {step === 2 && (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-[#F4EAD3] pb-4">
                <Tag className="w-5 h-5 text-[#C5A059]" />
                <h2 className="font-serif text-xl font-semibold text-[#111111]">
                  Discounts &amp; Promotional Codes
                </h2>
              </div>

              {/* Auto Spend Tier Banner */}
              {autoTierDiscount.tier ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-sans text-emerald-800">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block font-serif">
                      Automatic Spend Tier Bonus Unlocked ({autoTierDiscount.percent}% OFF)!
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      You saved ₹{autoTierDiscount.amount.toLocaleString('en-IN')} by spending over ₹{autoTierDiscount.tier.min_spend.toLocaleString('en-IN')}.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F8F3E6] border border-[#EADFC9] rounded-2xl text-xs font-sans text-gray-600">
                  <p>
                    Spend over ₹10,000 to automatically unlock a <strong>5% Spend Tier Discount</strong> (10% at ₹25,000, 15% at ₹50,000).
                  </p>
                </div>
              )}

              {/* Coupon Code Input */}
              <div className="space-y-3 pt-2">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[11px] font-sans">
                  Apply Privilege Coupon Code
                </label>
                
                {appliedCoupon ? (
                  <div className="p-4 bg-amber-50 border border-[#C5A059] rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5 text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#111111]">{appliedCoupon.code}</span>
                        <span className="text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded font-semibold">
                          Applied
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        {appliedCoupon.discount_percent
                          ? `${appliedCoupon.discount_percent}% instant store discount`
                          : `Flat ₹${appliedCoupon.discount_amount} voucher discount`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-sans text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try: WELCOME10 or FOREVERE20"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#C5A059] text-[#111111]"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#111111] hover:bg-[#C5A059] text-white rounded-xl text-xs font-sans uppercase tracking-wider font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-xs text-rose-600 font-sans">{couponError}</p>
                )}
              </div>

              {/* Gift Message & Wrapping Option */}
              <div className="border-t border-[#EADFC9] pt-4 space-y-3">
                <label className="flex items-center gap-2 text-xs font-sans text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4"
                  />
                  <span className="font-semibold">This order is a gift (Complimentary gift wrap &amp; message card)</span>
                </label>

                {isGift && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-sans">
                      Personal Gift Message for Recipient
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Wishing you a lifetime of brilliance and joy..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-xs text-[#111111]"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-[#EADFC9] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-300 rounded-full text-xs font-sans text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow flex items-center gap-2 transition-colors"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD & ADAPTER */}
          {step === 3 && (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#F4EAD3] pb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#C5A059]" />
                  <h2 className="font-serif text-xl font-semibold text-[#111111]">
                    Select Payment Method
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-sans">
                  <ShieldCheck className="w-4 h-4" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Method Cards */}
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.name)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      selectedPaymentMethod === method.name
                        ? 'border-[#C5A059] bg-[#F8F3E6]/40 shadow-sm'
                        : 'border-[#EADFC9] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-xs font-sans">
                      <div className="w-10 h-10 rounded-xl bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center shrink-0">
                        {getMethodIcon(method.name)}
                      </div>
                      <div>
                        <h4 className="font-serif font-semibold text-sm text-[#111111]">{method.name}</h4>
                        <p className="text-[10px] text-gray-500 font-sans">
                          {method.name.includes('COD')
                            ? 'Pay cash upon doorstep delivery & inspection'
                            : 'Instant authorization with mock payment gateway'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedPaymentMethod === method.name
                          ? 'border-[#C5A059] bg-[#C5A059] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPaymentMethod === method.name && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Security info */}
              <div className="p-4 bg-[#FDFBF7] border border-[#EADFC9] rounded-2xl text-[11px] text-gray-500 font-sans space-y-1">
                <p className="font-semibold text-gray-700">Forevere Mock Payment Adapter Active</p>
                <p>Clicking Complete Payment simulates instant gateway authorization and records your order.</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#EADFC9] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isProcessing}
                  className="px-6 py-2.5 border border-gray-300 rounded-full text-xs font-sans text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing || cartItems.length === 0}
                  onClick={handleCompleteOrder}
                  className="px-8 py-4 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold rounded-full shadow-lg flex items-center gap-3 transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-[#C5A059]" />
                  <span>{isProcessing ? 'Authorizing Payment...' : `Complete Order (₹${finalTotal.toLocaleString('en-IN')})`}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Order Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-semibold text-[#111111] border-b border-[#F4EAD3] pb-4">
              Order Summary ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)
            </h3>

            {/* Item Mini List */}
            <div className="divide-y divide-[#F4EAD3] max-h-60 overflow-y-auto space-y-3">
              {cartItems.map((item) => {
                const prod = item.product || mockDB.products.find((p) => p.id === item.product_id);
                if (!prod) return null;
                const price = prod.discount_percent > 0 ? prod.price * (1 - prod.discount_percent / 100) : prod.price;

                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3 text-xs font-sans">
                    <img src={prod.images?.[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#EADFC9]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-[#111111] truncate">{prod.name}</p>
                      <p className="text-gray-400 text-[10px]">Qty: {item.quantity} &bull; ₹{price.toLocaleString('en-IN')} ea</p>
                    </div>
                    <span className="font-serif font-bold text-[#111111]">
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-[#EADFC9] pt-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-serif font-semibold text-[#111111]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {autoTierDiscount.amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Spend Tier Discount ({autoTierDiscount.percent}%)</span>
                  <span>- ₹{autoTierDiscount.amount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>- ₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Express Insured Shipping</span>
                <span className="text-emerald-700 font-semibold uppercase text-[10px]">FREE</span>
              </div>

              <div className="border-t border-[#EADFC9] pt-3 flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-[#111111]">Final Total</span>
                <span className="font-serif font-bold text-xl text-[#111111]">
                  ₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Loyalty Point Earn Tag */}
            <div className="p-3 bg-[#F8F3E6] border border-[#EADFC9] rounded-xl text-center text-xs font-sans text-[#C5A059] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>You will earn <strong>{Math.floor(finalTotal * 0.05)} Jewel Points</strong> on this order!</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
