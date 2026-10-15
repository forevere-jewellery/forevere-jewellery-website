'use client';

import React, { useState, useEffect } from 'react';
import { PointsSettings, PointsLedgerEntry } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';
import { useToast } from '@/components/ui/Toast';
import {
  Gift,
  Save,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Settings,
  History,
  Trophy,
  Share2,
  Copy,
  CheckCircle2
} from 'lucide-react';

type ActiveTab = 'settings' | 'ledger' | 'referrals';

export function LoyaltyPointsManager() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');

  // Settings
  const [settings, setSettings] = useState<PointsSettings>(mockDB.pointsSettings);
  const [pointsPerUnit, setPointsPerUnit] = useState('');
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');
  const [conversionRules, setConversionRules] = useState<Array<{ points: number; discount_amount: number }>>([]);

  // Ledger
  const [ledger, setLedger] = useState<PointsLedgerEntry[]>([]);

  // Referral settings
  const [referralReward, setReferralReward] = useState('50');
  const [refereeReward, setRefereeReward] = useState('25');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    mockDB.loadFromLocalStorage();
    const s = mockDB.pointsSettings;
    setSettings(s);
    setPointsPerUnit(String(s.points_per_currency_unit));
    setSingular(s.point_name_singular);
    setPlural(s.point_name_plural);
    setConversionRules([...(s.point_to_coupon_conversion_rules || [])]);
    setLedger([...mockDB.pointsLedger]);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    mockDB.pointsSettings = {
      ...mockDB.pointsSettings,
      points_per_currency_unit: parseFloat(pointsPerUnit) || 0.05,
      point_name_singular: singular.trim() || 'Jewel Point',
      point_name_plural: plural.trim() || 'Jewel Points',
      point_to_coupon_conversion_rules: conversionRules
    };
    mockDB.saveToLocalStorage();
    loadData();
    showToast('Settings Saved', 'Loyalty program configuration updated.', 'success');
  };

  const addConversionRule = () => {
    setConversionRules([...conversionRules, { points: 100, discount_amount: 100 }]);
  };

  const updateConversionRule = (index: number, field: 'points' | 'discount_amount', value: string) => {
    const updated = [...conversionRules];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setConversionRules(updated);
  };

  const removeConversionRule = (index: number) => {
    setConversionRules(conversionRules.filter((_, i) => i !== index));
  };

  const totalPointsEarned = ledger.filter((e) => e.points > 0).reduce((a, b) => a + b.points, 0);
  const totalPointsRedeemed = ledger.filter((e) => e.points < 0).reduce((a, b) => a + Math.abs(b.points), 0);

  const TABS: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'settings', label: 'Program Settings', icon: <Settings className="w-4 h-4" /> },
    { key: 'ledger', label: 'Points Ledger', icon: <History className="w-4 h-4" /> },
    { key: 'referrals', label: 'Referral Program', icon: <Share2 className="w-4 h-4" /> }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#EADFC9] pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] text-[#C5A059] text-[10px] font-semibold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5" />
          <span>Loyalty &amp; Retention Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#111111]">Loyalty Points &amp; Referral Program</h1>
        <p className="text-xs text-gray-500 font-sans">
          Configure how customers earn and redeem loyalty points, set up point-to-coupon conversions, and manage the referral rewards program.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EADFC9] rounded-2xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-gray-500">Total Points Earned</span>
          </div>
          <p className="font-serif font-bold text-2xl text-[#111111]">{totalPointsEarned.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#EADFC9] rounded-2xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center gap-2 text-rose-500">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-gray-500">Total Points Redeemed</span>
          </div>
          <p className="font-serif font-bold text-2xl text-[#111111]">{totalPointsRedeemed.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#EADFC9] rounded-2xl p-5 space-y-1 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-gray-500">Earn Rate</span>
          </div>
          <p className="font-serif font-bold text-2xl text-[#111111]">{settings.points_per_currency_unit} pts/₹</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-white border border-[#EADFC9] rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#111111] text-[#C5A059] shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════ TAB: SETTINGS ═══════ */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-semibold text-[#111111] border-b border-[#F4EAD3] pb-4">
            Earning Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Points Earned per ₹1 Spent</label>
              <input
                type="number"
                step="0.01"
                value={pointsPerUnit}
                onChange={(e) => setPointsPerUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Point Name (Singular)</label>
              <input
                type="text"
                value={singular}
                onChange={(e) => setSingular(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Point Name (Plural)</label>
              <input
                type="text"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-xl text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <h3 className="font-serif text-lg font-semibold text-[#111111] border-b border-[#F4EAD3] pb-4 pt-4">
            Point → Coupon Conversion Rules
          </h3>
          <p className="text-xs text-gray-500 font-sans">
            Define how many points a customer can redeem for a store credit coupon. Multiple tiers allow flexible redemption.
          </p>

          <div className="space-y-3">
            {conversionRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-sans">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-gray-500 shrink-0 w-20">Points Cost:</label>
                  <input
                    type="number"
                    value={rule.points}
                    onChange={(e) => updateConversionRule(idx, 'points', e.target.value)}
                    className="w-24 px-2 py-1.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-lg text-[#111111]"
                  />
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-gray-500 shrink-0 w-20">₹ Discount:</label>
                  <input
                    type="number"
                    value={rule.discount_amount}
                    onChange={(e) => updateConversionRule(idx, 'discount_amount', e.target.value)}
                    className="w-24 px-2 py-1.5 bg-[#FDFBF7] border border-[#EADFC9] rounded-lg text-[#111111]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeConversionRule(idx)}
                  className="text-gray-400 hover:text-rose-600 p-1 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addConversionRule}
              className="text-xs font-sans text-[#C5A059] hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Add Conversion Tier</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#EADFC9] flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ═══════ TAB: LEDGER ═══════ */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-[#EADFC9] rounded-3xl shadow-sm overflow-hidden">
          {ledger.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-[#FDFBF7] text-gray-500 border-b border-[#EADFC9]">
                    <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-4 font-semibold uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-4 font-semibold uppercase tracking-wider">Reason</th>
                    <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EAD3]">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-[10px]">{entry.user_id.slice(0, 12)}...</td>
                      <td className="px-4 py-4 text-[#111111]">{entry.reason}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-serif font-bold ${entry.points > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F8F3E6] text-[#C5A059] flex items-center justify-center mx-auto">
                <History className="w-7 h-7" />
              </div>
              <p className="text-xs text-gray-500 font-sans">No points activity recorded yet. Points are earned when customers place orders.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB: REFERRALS ═══════ */}
      {activeTab === 'referrals' && (
        <div className="bg-white border border-[#EADFC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F4EAD3] pb-4">
            <Share2 className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif text-lg font-semibold text-[#111111]">Referral Program Configuration</h3>
          </div>

          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            When a customer shares their unique referral code with a friend and the friend completes their first purchase,
            both parties earn bonus loyalty points. Configure the reward amounts below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
            <div className="bg-[#F8F3E6] border border-[#EADFC9] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#C5A059]">
                <Users className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Referrer Reward</span>
              </div>
              <p className="text-gray-600">Points awarded to the customer who shares their code.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={referralReward}
                  onChange={(e) => setReferralReward(e.target.value)}
                  className="w-24 px-3 py-2 bg-white border border-[#EADFC9] rounded-xl text-[#111111] font-serif font-bold"
                />
                <span className="text-gray-500">{plural}</span>
              </div>
            </div>

            <div className="bg-[#F8F3E6] border border-[#EADFC9] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#C5A059]">
                <Gift className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Referee Welcome Bonus</span>
              </div>
              <p className="text-gray-600">Points awarded to the new friend on their first order.</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={refereeReward}
                  onChange={(e) => setRefereeReward(e.target.value)}
                  className="w-24 px-3 py-2 bg-white border border-[#EADFC9] rounded-xl text-[#111111] font-serif font-bold"
                />
                <span className="text-gray-500">{plural}</span>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="border-t border-[#EADFC9] pt-4 space-y-2">
            <h4 className="font-serif font-semibold text-sm text-[#111111]">How It Works for Customers</h4>
            <ol className="text-xs text-gray-600 font-sans list-decimal list-inside space-y-1">
              <li>Customer finds their unique referral code in their Profile → Referral section.</li>
              <li>They share the code with friends via link, WhatsApp, or social media.</li>
              <li>Friend creates a Forevere account and enters the referral code at registration.</li>
              <li>When the friend completes their first order, both parties receive bonus points.</li>
              <li>Points are credited automatically and appear in their loyalty balance.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showToast('Referral Settings Saved', 'Referral reward configuration saved.', 'success')}
              className="px-8 py-3 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Referral Settings</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
