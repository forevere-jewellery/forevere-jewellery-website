import 'server-only';
import { NextRequest } from 'next/server';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';

export async function verifyAdminRequest(_request: Request | NextRequest): Promise<{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}> {
  if (!isRealSupabaseConfigured()) {
    return { isAdmin: false, error: 'Access denied: Administrator privileges required.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { isAdmin: false, error: 'Unauthorized: No active user session.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let role = profile?.role;
    if (!role) {
      const { data: legacyProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      role = legacyProfile?.role;
    }

    return role === 'admin'
      ? { isAdmin: true, userId: user.id }
      : { isAdmin: false, error: 'Forbidden: Insufficient privileges.' };
  } catch {
    return { isAdmin: false, error: 'Internal authorization error.' };
  }
}
