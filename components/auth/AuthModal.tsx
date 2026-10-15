'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/Toast';
import { X, Sparkles, Mail, Lock, Phone, User } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithEmail,
    signupWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    loginWithGoogle,
    updateProfile,
  } = useAuth();

  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'phone' | 'complete_profile'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Form states - always initialize completely empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setOtpCode('');
    setFullName('');
    setOtpSent(false);
    setErrorMessage(null);
  };

  // Reset form whenever modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      resetForm();
      setMode('login');
      setAuthMethod('email');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleModeChange = (newMode: 'login' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleAuthMethodChange = (newMethod: 'email' | 'phone') => {
    resetForm();
    setAuthMethod(newMethod);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      setLoading(false);
      if (res.success) {
        showToast('Welcome back', 'You have successfully signed into Forevere.', 'success');
        handleClose();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } else {
      const res = await signupWithEmail(email, password, fullName, phoneNumber);
      setLoading(false);
      if (res.success) {
        if (res.confirmationSent) {
          showToast(
            'Confirmation Link Sent',
            'Please check your email to verify your account.',
            'info'
          );
          handleClose();
        } else if (res.needsProfileCompletion) {
          setMode('complete_profile');
        } else {
          showToast('Account Created', 'Welcome to Forevere Jewellery!', 'success');
          handleClose();
        }
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await sendPhoneOtp(phoneNumber);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      showToast('OTP Sent', 'A verification code has been dispatched to your phone.', 'info');
    } else {
      setErrorMessage(res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    const res = await verifyPhoneOtp(phoneNumber, otpCode);
    setLoading(false);
    if (res.success) {
      if (res.needsProfileCompletion) {
        setMode('complete_profile');
      } else {
        showToast('Phone Verified', 'Signed in successfully with your mobile number.', 'success');
        handleClose();
      }
    } else {
      setErrorMessage(res.error || 'Invalid OTP code.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res?.success && res?.error) {
      setErrorMessage(res.error);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    const res = await updateProfile(fullName, phoneNumber);
    setLoading(false);
    if (res.success) {
      showToast('Profile Completed', 'Your luxury account is ready.', 'success');
      handleClose();
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6 text-[#111111]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E6] border border-[#EADFC9] text-[#C5A059] text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Forevere Privilege</span>
          </div>
          <h2 className="text-2xl font-serif text-[#111111]">
            {mode === 'complete_profile'
              ? 'Complete Your Profile'
              : mode === 'signup'
              ? 'Join Forevere Jewellery'
              : 'Sign In to Forevere'}
          </h2>
          <p className="text-xs text-gray-500 font-sans">
            {mode === 'complete_profile'
              ? 'Please provide your details to unlock exclusive loyalty perks.'
              : 'Access your insured bag, saved ring sizing, and reward points.'}
          </p>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-sans">
            {errorMessage}
          </div>
        )}

        {/* COMPLETE PROFILE MODE */}
        {mode === 'complete_profile' ? (
          <form onSubmit={handleCompleteProfile} autoComplete="off" className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Sophia Lawrence"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                Phone Number (For Order Updates)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  autoComplete="off"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow transition-all disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Complete & Continue'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Mode Switch Tabs */}
            <div className="flex border-b border-[#EADFC9] text-xs font-sans uppercase tracking-wider text-center">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`flex-1 pb-2.5 font-semibold transition-colors ${
                  mode === 'login'
                    ? 'border-b-2 border-[#C5A059] text-[#111111]'
                    : 'text-gray-400 hover:text-[#111111]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className={`flex-1 pb-2.5 font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'border-b-2 border-[#C5A059] text-[#111111]'
                    : 'text-gray-400 hover:text-[#111111]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Auth Method Pill Selector */}
            <div className="flex items-center justify-center gap-2 bg-[#F8F3E6] p-1 rounded-xl border border-[#EADFC9]">
              <button
                type="button"
                onClick={() => handleAuthMethodChange('email')}
                className={`flex-1 py-1.5 text-xs font-sans rounded-lg font-medium transition-all ${
                  authMethod === 'email' ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-500'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleAuthMethodChange('phone')}
                className={`flex-1 py-1.5 text-xs font-sans rounded-lg font-medium transition-all ${
                  authMethod === 'phone' ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-500'
                }`}
              >
                Phone (OTP)
              </button>
            </div>

            {/* EMAIL AUTH FORM */}
            {authMethod === 'email' ? (
              <form onSubmit={handleEmailAuth} autoComplete="off" className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Sophia Lawrence"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      placeholder="sophia@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                      Password *
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow transition-all disabled:opacity-50"
                >
                  {loading
                    ? 'Authenticating...'
                    : mode === 'signup'
                    ? 'Create My Account'
                    : 'Sign In'}
                </button>
              </form>
            ) : (
              /* PHONE OTP AUTH FORM */
              <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                    Mobile Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        autoComplete="off"
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EADFC9] rounded-xl text-base sm:text-xs focus:outline-none focus:border-[#C5A059] text-[#111111]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-4 py-2.5 bg-[#F8F3E6] border border-[#EADFC9] text-[#C5A059] hover:bg-[#C5A059] hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
                    >
                      {otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-[11px] font-sans uppercase tracking-wider text-gray-600 font-semibold">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoComplete="off"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#C5A059] rounded-xl text-center text-base tracking-[0.5em] font-serif font-bold text-[#111111] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#111111] hover:bg-[#C5A059] text-white text-xs font-sans uppercase tracking-widest font-semibold rounded-full shadow transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying Code...' : 'Verify & Continue'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-[#EADFC9] w-full" />
              <span className="bg-[#FDFBF7] px-3 text-[10px] uppercase tracking-widest text-gray-400 font-sans">
                OR
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-gray-50 border border-[#EADFC9] rounded-full text-xs font-sans font-medium text-[#111111] flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
