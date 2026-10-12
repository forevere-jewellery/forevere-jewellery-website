'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/database';
import { mockDB } from '@/lib/supabase/mock-db';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (initialView?: 'login' | 'signup' | 'phone') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, pass: string, fullName?: string, phone?: string) => Promise<{ success: boolean; error?: string; needsProfileCompletion?: boolean }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; mockOtp?: string; error?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string; needsProfileCompletion?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialView, setAuthModalInitialView] = useState<'login' | 'signup' | 'phone'>('login');

  useEffect(() => {
    // Check initial user from localStorage/cookie
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('fj_current_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          mockDB.currentUser = parsed;
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (initialView: 'login' | 'signup' | 'phone' = 'login') => {
    setAuthModalInitialView(initialView);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const saveUserSession = (profile: UserProfile) => {
    setUser(profile);
    mockDB.currentUser = profile;
    mockDB.saveToLocalStorage();
    if (typeof document !== 'undefined') {
      document.cookie = `fj_role=${profile.role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `fj_user_id=${profile.id}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    // Validation
    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const profile: UserProfile = {
      id: 'u-' + Math.random().toString(36).substring(2, 11),
      full_name: email.split('@')[0].replace('.', ' '),
      phone: '+91 9876543210',
      phone_verified: true,
      role: 'customer',
      loyalty_points: 150,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString()
    };

    saveUserSession(profile);
    setIsLoading(false);
    return { success: true };
  };

  const signupWithEmail = async (email: string, pass: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Email and password are required.' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const needsProfileCompletion = !fullName || !phone;
    const profile: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      full_name: fullName || null,
      phone: phone || null,
      phone_verified: false,
      role: 'customer',
      loyalty_points: 50, // Welcome signup bonus
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString()
    };

    saveUserSession(profile);
    setIsLoading(false);
    return { success: true, needsProfileCompletion };
  };

  const sendPhoneOtp = async (phone: string) => {
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Please enter a valid phone number (10+ digits).' };
    }
    // Mock OTP generation
    return { success: true, mockOtp: '123456' };
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    if (otp !== '123456' && otp !== '000000') {
      return { success: false, error: 'Invalid verification code. Use mock code 123456.' };
    }

    const profile: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      full_name: null,
      phone: phone,
      phone_verified: true,
      role: 'customer',
      loyalty_points: 50,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString()
    };

    saveUserSession(profile);
    return { success: true, needsProfileCompletion: true };
  };

  const loginWithGoogle = async () => {
    const profile: UserProfile = {
      id: 'u-google-' + Math.random().toString(36).substr(2, 9),
      full_name: 'Elena Rostova',
      phone: '+1 555-0192',
      phone_verified: true,
      role: 'customer',
      loyalty_points: 100,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString()
    };

    saveUserSession(profile);
    return { success: true };
  };

  const updateProfile = async (fullName: string, phone: string) => {
    if (!user) return { success: false, error: 'User is not signed in.' };
    if (!fullName.trim()) return { success: false, error: 'Full name is required.' };

    const updated: UserProfile = {
      ...user,
      full_name: fullName.trim(),
      phone: phone.trim() || user.phone
    };

    saveUserSession(updated);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    mockDB.currentUser = null;
    mockDB.saveToLocalStorage();
    if (typeof document !== 'undefined') {
      document.cookie = 'fj_role=; path=/; max-age=0';
      document.cookie = 'fj_user_id=; path=/; max-age=0';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        signupWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithGoogle,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
