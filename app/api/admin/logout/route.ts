import { NextResponse } from 'next/server';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.auth.signOut();
      } catch {
        // Continue clearing cookies
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    response.cookies.delete('fj_admin_token');
    response.cookies.delete('fj_role');
    response.cookies.delete('fj_user_id');

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to sign out.' },
      { status: 500 }
    );
  }
}
