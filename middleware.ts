import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let user: any = null;
  let userRole: string | null = null;

  // 1. Refresh Supabase Auth Session using @supabase/ssr
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      // Calling getUser() validates and refreshes the token with Supabase Auth server
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;

      if (user) {
        // Look up role in profiles table first
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role) {
          userRole = profile.role;
        } else {
          // Fallback to legacy users table or admin email check
          const { data: legacyUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          userRole = legacyUser?.role || 'customer';
        }
      }
    } catch {
      // In case of network failure during token refresh, continue
    }
  }

  // 2. Admin access requires a validated Supabase session and database role.
  const isAdmin = Boolean(user && userRole === 'admin');

  // 3. Protect all /api/admin routes except /api/admin/login and /api/admin/logout
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login' && pathname !== '/api/admin/logout') {
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Administrator access required.' },
        { status: 401 }
      );
    }
  }

  // 4. Protect all /admin pages except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      if (user && userRole !== 'admin') {
        loginUrl.searchParams.set('error', 'forbidden');
      } else {
        loginUrl.searchParams.set('error', 'unauthorized');
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Add Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
