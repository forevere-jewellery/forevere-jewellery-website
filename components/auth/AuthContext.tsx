'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, UserRole } from '@/types/database';
import { createClient, isRealSupabaseConfigured } from '@/lib/supabase/client';
import { mockDB } from '@/lib/supabase/mock-db';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (initialView?: 'login' | 'signup' | 'phone') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (
    email: string,
    pass: string,
    fullName?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string; needsProfileCompletion?: boolean; confirmationSent?: boolean }>;
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

  const [supabase] = useState(() => createClient());

  const fetchProfile = useCallback(async (userId: string, authEmail?: string, authMeta?: any): Promise<UserProfile> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        return {
          id: profile.id,
          full_name: profile.full_name || authMeta?.full_name || authMeta?.name || '',
          email: profile.email || authEmail || null,
          phone: profile.phone || authMeta?.phone || null,
          phone_verified: Boolean(profile.phone || authMeta?.phone_verified),
          role: (profile.role as UserRole) || 'customer',
          points: profile.points ?? profile.loyalty_points ?? 50,
          loyalty_points: profile.loyalty_points ?? profile.points ?? 50,
          referral_code: profile.referral_code || 'REF' + profile.id.substring(0, 6).toUpperCase(),
          referred_by: profile.referred_by || null,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };
      }

      const { data: legacyUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (legacyUser) {
        return {
          id: legacyUser.id,
          full_name: legacyUser.full_name || authMeta?.full_name || '',
          email: authEmail || null,
          phone: legacyUser.phone || authMeta?.phone || null,
          phone_verified: Boolean(legacyUser.phone_verified),
          role: (legacyUser.role as UserRole) || 'customer',
          points: legacyUser.loyalty_points || 50,
          loyalty_points: legacyUser.loyalty_points || 50,
          referral_code: legacyUser.referral_code || 'REF' + legacyUser.id.substring(0, 6).toUpperCase(),
          referred_by: legacyUser.referred_by || null,
          created_at: legacyUser.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[AuthContext] Could not fetch profile from database:', err);
    }

    return {
      id: userId,
      full_name: authMeta?.full_name || authMeta?.name || authEmail?.split('@')[0] || 'Privileged Member',
      email: authEmail || null,
      phone: authMeta?.phone || null,
      phone_verified: false,
      role: 'customer',
      points: 50,
      loyalty_points: 50,
      referral_code: 'REF' + userId.substring(0, 6).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString(),
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        if (isRealSupabaseConfigured()) {
          const { data: { user: authUser }, error } = await supabase.auth.getUser();

          if (!error && authUser && isMounted) {
            const profile = await fetchProfile(authUser.id, authUser.email, authUser.user_metadata);
            if (isMounted) {
              setUser(profile);
              mockDB.currentUser = profile;
            }
          } else if (isMounted) {
            setUser(null);
            mockDB.currentUser = null;
          }
        } else {
          const savedUser = typeof window !== 'undefined' ? localStorage.getItem('fj_current_user') : null;
          if (savedUser && isMounted) {
            try {
              const parsed = JSON.parse(savedUser);
              setUser(parsed);
              mockDB.currentUser = parsed;
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    if (isRealSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
            if (isMounted) {
              setUser(profile);
              mockDB.currentUser = profile;
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            mockDB.currentUser = null;
            if (typeof window !== 'undefined') {
              localStorage.removeItem('fj_current_user');
            }
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      return () => {
        isMounted = false;
      };
    }
  }, [supabase, fetchProfile]);

  const openAuthModal = (initialView: 'login' | 'signup' | 'phone' = 'login') => {
    setAuthModalInitialView(initialView);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (isRealSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          let friendly = error.message;
          if (error.message.includes('Invalid login credentials')) {
            friendly = 'Invalid email or password. Please verify your credentials.';
          } else if (error.message.includes('Email not confirmed')) {
            friendly = 'Email not confirmed yet. Please check your inbox and click the verification link.';
          }
          return { success: false, error: friendly };
        }

        if (data.user) {
          const profile = await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
          setUser(profile);
          mockDB.currentUser = profile;
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'An unexpected error occurred during login.' };
      }
    }

    if (process.env.NODE_ENV === 'production') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is not configured. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.',
      };
    }

    const mockProfile: UserProfile = {
      id: '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0'),
      full_name: email.split('@')[0].replace('.', ' '),
      email,
      phone: '+919876543210',
      phone_verified: true,
      role: 'customer',
      points: 150,
      loyalty_points: 150,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString(),
    };
    setUser(mockProfile);
    mockDB.currentUser = mockProfile;
    mockDB.saveToLocalStorage();
    setIsLoading(false);
    return { success: true };
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    fullName?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string; needsProfileCompletion?: boolean; confirmationSent?: boolean }> => {
    setIsLoading(true);

    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Email and password are required.' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (isRealSupabaseConfigured()) {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const cleanEmail = email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: fullName?.trim() || cleanEmail.split('@')[0],
              phone: phone?.trim() || '',
            },
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });

        if (error) {
          setIsLoading(false);
          let friendly = error.message;
          if (
            error.message.includes('User already registered') ||
            error.message.includes('already exists')
          ) {
            friendly = 'An account with this email already exists. Please sign in instead.';
          } else if (error.message.includes('Password should be at least')) {
            friendly = 'Password is too weak. Please use at least 6 characters.';
          }
          return { success: false, error: friendly };
        }

        if (data.user) {
          if (!data.session) {
            setIsLoading(false);
            return {
              success: true,
              confirmationSent: true,
              needsProfileCompletion: false,
            };
          }

          const profile = await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
          setUser(profile);
          mockDB.currentUser = profile;
        }

        setIsLoading(false);
        const needsProfileCompletion = !fullName || !phone;
        return { success: true, needsProfileCompletion, confirmationSent: false };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Failed to complete registration.' };
      }
    }

    if (process.env.NODE_ENV === 'production') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is not configured. Please check your Supabase environment variables on Vercel.',
      };
    }

    const mockProfile: UserProfile = {
      id: '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0'),
      full_name: fullName || email.split('@')[0],
      email,
      phone: phone || null,
      phone_verified: false,
      role: 'customer',
      points: 50,
      loyalty_points: 50,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString(),
    };
    setUser(mockProfile);
    mockDB.currentUser = mockProfile;
    mockDB.saveToLocalStorage();
    setIsLoading(false);
    return { success: true, needsProfileCompletion: !fullName || !phone };
  };

  const sendPhoneOtp = async (phone: string): Promise<{ success: boolean; mockOtp?: string; error?: string }> => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return { success: false, error: 'Please enter a valid phone number (10+ digits).' };
    }

    if (isRealSupabaseConfigured()) {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        const digits = formattedPhone.replace(/\D/g, '');
        formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
      }

      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) {
          const isProviderMissing = error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('disabled');
          return {
            success: false,
            error: isProviderMissing
              ? 'Phone authentication is not enabled in your Supabase dashboard. Go to Supabase Auth > Providers > Phone and enable Twilio or MessageBird.'
              : error.message,
          };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to dispatch verification code.' };
      }
    }

    return { success: true, mockOtp: '123456' };
  };

  const verifyPhoneOtp = async (phone: string, otp: string): Promise<{ success: boolean; error?: string; needsProfileCompletion?: boolean }> => {
    if (!otp || otp.length < 6) {
      return { success: false, error: 'Please enter the complete 6-digit code.' };
    }

    if (isRealSupabaseConfigured()) {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        const digits = formattedPhone.replace(/\D/g, '');
        formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp.trim(),
          type: 'sms',
        });

        if (error) {
          return { success: false, error: error.message || 'Invalid verification code.' };
        }

        if (data.user) {
          const profile = await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
          setUser(profile);
          mockDB.currentUser = profile;
        }

        return { success: true, needsProfileCompletion: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to verify OTP code.' };
      }
    }

    if (otp !== '123456' && otp !== '000000') {
      return { success: false, error: 'Invalid verification code. Use mock code 123456.' };
    }

    const mockProfile: UserProfile = {
      id: '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0'),
      full_name: null,
      email: `${phone.replace(/\D/g, '')}@phone.forevere.in`,
      phone,
      phone_verified: true,
      role: 'customer',
      points: 50,
      loyalty_points: 50,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString(),
    };
    setUser(mockProfile);
    mockDB.currentUser = mockProfile;
    mockDB.saveToLocalStorage();
    return { success: true, needsProfileCompletion: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isRealSupabaseConfigured()) {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          const isProviderMissing = error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('not enabled');
          return {
            success: false,
            error: isProviderMissing
              ? 'Google OAuth is not enabled in your Supabase dashboard. Please go to Supabase Auth > Providers > Google, toggle it ON, and add your Google Client ID and Secret.'
              : error.message,
          };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to initiate Google login.' };
      }
    }

    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Google authentication is unavailable because Supabase is not configured on Vercel.',
      };
    }

    const mockProfile: UserProfile = {
      id: '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0'),
      full_name: 'Elena Rostova',
      email: 'elena@forevere.in',
      phone: '+919876543210',
      phone_verified: true,
      role: 'customer',
      points: 100,
      loyalty_points: 100,
      referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referred_by: null,
      created_at: new Date().toISOString(),
    };
    setUser(mockProfile);
    mockDB.currentUser = mockProfile;
    mockDB.saveToLocalStorage();
    return { success: true };
  };

  const updateProfile = async (fullName: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not signed in.' };
    if (!fullName.trim()) return { success: false, error: 'Full name is required.' };

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || user.phone,
          },
        });

        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            phone: phone.trim() || user.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('[AuthContext] Could not update profile in Supabase:', err);
      }
    }

    const updated: UserProfile = {
      ...user,
      full_name: fullName.trim(),
      phone: phone.trim() || user.phone,
    };

    setUser(updated);
    mockDB.currentUser = updated;
    mockDB.saveToLocalStorage();
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthContext] Sign out error:', err);
      }
    }

    setUser(null);
    mockDB.currentUser = null;
    mockDB.saveToLocalStorage();

    if (typeof document !== 'undefined') {
      document.cookie = 'fj_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'fj_user_id=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'fj_admin_token=; path=/; max-age=0; SameSite=Lax';
      localStorage.removeItem('fj_current_user');
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
        logout,
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
