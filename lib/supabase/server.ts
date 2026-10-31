import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isRealSupabaseConfigured } from './client';
import { mockDB } from './mock-db';

export async function createClient(): Promise<any> {
  if (isRealSupabaseConfigured()) {
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Read-only server component context: cookies cannot be set during SSR
            }
          },
        },
      }
    );
  }

  // If in production and Supabase is not configured, do not silently fall back
  if (process.env.NODE_ENV === 'production') {
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: new Error('Supabase is not configured on production.') };
        },
        async getSession() {
          return { data: { session: null }, error: new Error('Supabase is not configured on production.') };
        },
        async signInWithPassword() {
          return { data: { user: null }, error: new Error('Supabase is not configured on production.') };
        },
        async signUp() {
          return { data: { user: null }, error: new Error('Supabase is not configured on production.') };
        },
      },
      from() {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase is not configured') }) }) }),
        };
      },
    };
  }

  // Local development mock query builder
  const createMockBuilder = (table: string) => {
    let currentData = [...((mockDB as any)[table] || [])];

    const builder = {
      select() {
        return builder;
      },
      eq(col: string, val: any) {
        currentData = currentData.filter((i: any) => i[col] === val);
        return builder;
      },
      in(col: string, vals: any[]) {
        currentData = currentData.filter((i: any) => vals.includes(i[col]));
        return builder;
      },
      order(col: string, { ascending = true }: { ascending?: boolean } = {}) {
        currentData = [...currentData].sort((a: any, b: any) =>
          a[col] > b[col] ? (ascending ? 1 : -1) : ascending ? -1 : 1
        );
        return builder;
      },
      limit(n: number) {
        currentData = currentData.slice(0, n);
        return builder;
      },
      async single() {
        return Promise.resolve({ data: currentData[0] || null, error: null });
      },
      then(onfulfilled?: (value: any) => any) {
        return Promise.resolve({ data: currentData, error: null }).then(onfulfilled);
      },
    };

    return builder;
  };

  // Server-side Mock client fallback for local development only
  return {
    auth: {
      async getUser() {
        return Promise.resolve({
          data: {
            user: mockDB.currentUser
              ? {
                  id: mockDB.currentUser.id,
                  email: (mockDB.currentUser.full_name?.toLowerCase().replace(/\s+/g, '') || 'user') + '@example.com',
                  user_metadata: {
                    full_name: mockDB.currentUser.full_name,
                    phone: mockDB.currentUser.phone,
                  },
                }
              : null,
          },
          error: null,
        });
      },
      async getSession() {
        return Promise.resolve({
          data: { session: mockDB.currentUser ? { user: { id: mockDB.currentUser.id } } : null },
          error: null,
        });
      },
      async signInWithPassword({ email }: { email: string }) {
        const id = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
        mockDB.currentUser = {
          id,
          full_name: email.split('@')[0] || 'Valued Customer',
          email,
          phone: '+919876543210',
          phone_verified: true,
          role: 'customer',
          loyalty_points: 150,
          points: 150,
          referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          referred_by: null,
          created_at: new Date().toISOString(),
        };
        return Promise.resolve({ data: { user: mockDB.currentUser }, error: null });
      },
      async signUp({ email, options }: { email: string; options?: any }) {
        const id = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
        mockDB.currentUser = {
          id,
          full_name: options?.data?.full_name || email.split('@')[0],
          email,
          phone: options?.data?.phone || null,
          phone_verified: false,
          role: 'customer',
          loyalty_points: 50,
          points: 50,
          referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          referred_by: null,
          created_at: new Date().toISOString(),
        };
        return Promise.resolve({ data: { user: mockDB.currentUser }, error: null });
      },
    },
    from(table: string) {
      if (table === 'profiles' || table === 'users') {
        return createMockBuilder('users');
      }
      return createMockBuilder(table);
    },
  };
}

/**
 * Server-only Supabase client initialized with the SERVICE_ROLE_KEY.
 * This client bypasses Row Level Security (RLS) and must NEVER be leaked to the client.
 */
export function createAdminClient(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (
    url &&
    serviceKey &&
    !url.includes('TEMP_') &&
    !serviceKey.includes('TEMP_') &&
    serviceKey.length > 20
  ) {
    return createSupabaseClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return null;
}
