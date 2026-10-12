import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isRealSupabaseConfigured } from './client';
import { mockDB } from './mock-db';

export async function createClient(): Promise<any> {
  if (isRealSupabaseConfigured()) {
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
              // Read-only server component context
            }
          },
        },
      }
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

  // Server-side Mock client fallback
  return {
    auth: {
      async getUser() {
        return Promise.resolve({
          data: {
            user: mockDB.currentUser
              ? { id: mockDB.currentUser.id, email: (mockDB.currentUser.full_name?.toLowerCase().replace(/\s+/g, '') || 'user') + '@example.com' }
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
    },
    from(table: string) {
      return createMockBuilder(table);
    },
  };
}
