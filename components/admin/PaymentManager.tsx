'use client';

import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Banknote,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';

export function PaymentManager() {
  const { showToast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    mockDB.loadFromLocalStorage();
    setMethods([...mockDB.paymentMethods]);
  };

  const handleToggle = (id: string) => {
    mockDB.paymentMethods = mockDB.paymentMethods.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    mockDB.saveToLocalStorage();
    loadPaymentMethods();
    showToast('Payment Methods Updated', 'Checkout gateway options updated.', 'info');
  };

  const getIcon = (name: string) => {
    if (name.includes('UPI')) return <QrCode className="w-5 h-5 text-[#C5A059]" />;
    if (name.includes('Net Banking')) return <Building2 className="w-5 h-5 text-[#C5A059]" />;
    if (name.includes('Wallet')) return <Wallet className="w-5 h-5 text-[#C5A059]" />;
    if (name.includes('COD') || name.includes('Cash')) return <Banknote className="w-5 h-5 text-[#C5A059]" />;
    return <CreditCard className="w-5 h-5 text-[#C5A059]" />;
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Gateway Orchestration</span>
        </div>
        <h1 className="text-3xl font-serif text-[#111111]">Payment Methods &amp; Gateways</h1>
        <p className="text-xs text-gray-500 font-sans">
          Enable or disable payment methods accepted at customer checkout.
        </p>
      </div>

      {/* Methods Table */}
      <div className="bg-white border border-[#EADFC9] rounded-3xl shadow-sm overflow-hidden">
        <div className="divide-y divide-[#F4EAD3]">
          {methods.map((method) => (
            <div key={method.id} className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F3E6] border border-[#EADFC9] flex items-center justify-center shrink-0">
                  {getIcon(method.name)}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-base text-[#111111]">{method.name}</h3>
                  <p className="text-xs text-gray-500 font-sans">
                    {method.name.includes('COD')
                      ? 'Offline doorstep settlement'
                      : 'Digital payment gateway integration'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(method.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold border transition-all ${
                  method.enabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {method.enabled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
