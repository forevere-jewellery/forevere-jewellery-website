import { createBrowserClient } from '@supabase/ssr';
import { createUnavailableQuery } from './unavailable-query';
import { mockDB } from './mock-db';

let browserClientInstance: any = null;

export function isRealSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const isConfigured = Boolean(
    url &&
    key &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('TEMP_SUPABASE_URL') &&
    !url.includes('your-project-id') &&
    !key.includes('TEMP_SUPABASE_ANON_KEY') &&
    !key.includes('your-supabase-anon-key') &&
    key.length > 20
  );

  if (!isConfigured && process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    console.error(
      '[Supabase Auth] CRITICAL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid in production! Mock auth is disabled in production.'
    );
  }

  return isConfigured;
}

export function createClient(): any {
  if (isRealSupabaseConfigured()) {
    if (!browserClientInstance) {
      browserClientInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
      );
    }
    return browserClientInstance;
  }

  // If in production and Supabase is not configured, do NOT silently fall back to mock auth
  if (process.env.NODE_ENV === 'production') {
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: new Error('Supabase Auth is not configured on production.') };
        },
        async getSession() {
          return { data: { session: null }, error: new Error('Supabase Auth is not configured on production.') };
        },
        async signInWithPassword() {
          return { data: { user: null, session: null }, error: new Error('Authentication is unavailable: Supabase credentials are not configured on Vercel.') };
        },
        async signUp() {
          return { data: { user: null, session: null }, error: new Error('Registration is unavailable: Supabase credentials are not configured on Vercel.') };
        },
        async signInWithOAuth() {
          return { data: null, error: new Error('OAuth is unavailable: Supabase credentials are not configured on Vercel.') };
        },
        async signInWithOtp() {
          return { data: null, error: new Error('Phone OTP is unavailable: Supabase credentials are not configured on Vercel.') };
        },
        async verifyOtp() {
          return { data: { user: null, session: null }, error: new Error('Phone OTP is unavailable: Supabase credentials are not configured on Vercel.') };
        },
        async signOut() {
          return { error: null };
        },
        onAuthStateChange() {
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
      },
      from() {
        return createUnavailableQuery();
      },
    };
  }

  // Local development fallback mock builder supporting chainable queries
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
      async insert(items: any | any[]) {
        const toAdd = Array.isArray(items) ? items : [items];
        if (Array.isArray((mockDB as any)[table])) {
          (mockDB as any)[table].push(...toAdd);
          mockDB.saveToLocalStorage();
        }
        return Promise.resolve({ data: items, error: null });
      },
      async update(updates: any) {
        return Promise.resolve({ data: updates, error: null });
      },
      async delete() {
        return Promise.resolve({ data: null, error: null });
      },
      then(onfulfilled?: (value: any) => any) {
        return Promise.resolve({ data: currentData, error: null }).then(onfulfilled);
      },
    };

    return builder;
  };

  // Fallback Mock Supabase Client for local development only
  return {
    auth: {
      async getUser() {
        return Promise.resolve({
          data: {
            user: mockDB.currentUser
              ? {
                  id: mockDB.currentUser.id,
                  email:
                    mockDB.currentUser.email ||
                    mockDB.currentUser.full_name?.toLowerCase().replace(/\s+/g, '') +
                    '@example.com',
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
        mockDB.saveToLocalStorage();
        return Promise.resolve({ data: { user: mockDB.currentUser, session: { user: mockDB.currentUser } }, error: null });
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
        mockDB.saveToLocalStorage();
        return Promise.resolve({ data: { user: mockDB.currentUser, session: { user: mockDB.currentUser } }, error: null });
      },
      async signInWithOAuth() {
        return Promise.resolve({ data: null, error: null });
      },
      async signInWithOtp() {
        return Promise.resolve({ data: null, error: null });
      },
      async verifyOtp({ phone }: { phone: string }) {
        const id = '00000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14).padEnd(12, '0');
        mockDB.currentUser = {
          id,
          full_name: 'Verified Customer',
          email: `${phone.replace(/\D/g, '')}@phone.forevere.in`,
          phone,
          phone_verified: true,
          role: 'customer',
          loyalty_points: 50,
          points: 50,
          referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          referred_by: null,
          created_at: new Date().toISOString(),
        };
        mockDB.saveToLocalStorage();
        return Promise.resolve({ data: { user: mockDB.currentUser, session: { user: mockDB.currentUser } }, error: null });
      },
      async signOut() {
        mockDB.currentUser = null;
        mockDB.saveToLocalStorage();
        return Promise.resolve({ error: null });
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe: () => {} } } };
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
