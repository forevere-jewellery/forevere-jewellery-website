'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { mockDB } from '@/lib/supabase/mock-db';

export default function AdminLoginPage() {
  const router = useRouter();
  // Form states start completely empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const adminProfile = {
          id: 'admin-user-id',
          full_name: 'Forevere Admin',
          phone: '',
          phone_verified: true,
          role: 'admin' as const,
          loyalty_points: 0,
          referral_code: '',
          referred_by: null,
          created_at: new Date().toISOString(),
        };

        mockDB.currentUser = adminProfile;
        mockDB.saveToLocalStorage();

        setIsLoading(false);
        router.push('/admin/products');
      } else {
        setIsLoading(false);
        setErrorMessage(data?.error || 'Access Denied: Invalid administrator credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-gray-950 border border-[#C5A059]/40 rounded-3xl p-8 shadow-2xl space-y-8 relative z-10">
        {/* Brand Logo & Portal Tag */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/20 border border-[#C5A059]/60 flex items-center justify-center text-[#C5A059] mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-white">FOREVERE JEWELLARY</h1>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#C5A059]">
              Executive Admin Portal
            </span>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            Authorized personnel only. Direct store catalog &amp; order controls.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-sans uppercase tracking-wider text-gray-400 font-semibold">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                placeholder="Enter authorized email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-sans uppercase tracking-wider text-gray-400 font-semibold">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#C5A059] hover:bg-[#A8833C] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
