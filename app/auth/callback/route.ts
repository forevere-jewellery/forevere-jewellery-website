import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Query user's role to direct to correct initial destination
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'admin' && (next === '/' || next === '/admin/login')) {
            return NextResponse.redirect(`${origin}/admin/products`);
          }
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('[Auth Callback Error]:', err);
    }
  }

  // Redirect to home with notice if code exchange fails
  return NextResponse.redirect(`${origin}/?authError=unable_to_authenticate`);
}
