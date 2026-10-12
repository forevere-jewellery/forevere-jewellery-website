import { createBrowserClient } from '@supabase/ssr';
import { mockDB } from './mock-db';

export function isRealSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('TEMP_SUPABASE_URL') &&
    !key.includes('TEMP_SUPABASE_ANON_KEY')
  );
}

export function createClient(): any {
  if (isRealSupabaseConfigured()) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Helper builder for Mock queries supporting chainable .select().eq().order().single().limit()
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

  // Fallback Mock Supabase Client
  return {
    auth: {
      async getUser() {
        return Promise.resolve({
          data: {
            user: mockDB.currentUser
              ? {
                  id: mockDB.currentUser.id,
                  email:
                    mockDB.currentUser.full_name?.toLowerCase().replace(/\s+/g, '') +
                    '@example.com',
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
        mockDB.currentUser = {
          id: 'u-customer-1',
          full_name: email.split('@')[0] || 'Valued Customer',
          phone: '+18888888888',
          phone_verified: true,
          role: 'customer',
          loyalty_points: 150,
          referral_code: 'CUST123',
          referred_by: null,
          created_at: new Date().toISOString(),
        };
        mockDB.saveToLocalStorage();
        return Promise.resolve({ data: { user: mockDB.currentUser }, error: null });
      },
      async signUp({ email }: { email: string }) {
        mockDB.currentUser = {
          id: 'u-' + Date.now(),
          full_name: email.split('@')[0],
          phone: null,
          phone_verified: false,
          role: 'customer',
          loyalty_points: 0,
          referral_code: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          referred_by: null,
          created_at: new Date().toISOString(),
        };
        mockDB.saveToLocalStorage();
        return Promise.resolve({ data: { user: mockDB.currentUser }, error: null });
      },
      async signOut() {
        mockDB.currentUser = null;
        mockDB.saveToLocalStorage();
        return Promise.resolve({ error: null });
      },
    },
    from(table: string) {
      return createMockBuilder(table);
    },
  };
}
