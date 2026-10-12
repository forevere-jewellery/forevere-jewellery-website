import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/admin routes except /api/admin/login
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const adminToken = request.cookies.get('fj_admin_token')?.value;
    const isTokenValid = adminToken ? await verifyAdminToken(adminToken) : false;

    if (!isTokenValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Administrator access required.' },
        { status: 401 }
      );
    }
  }

  // Protect all /admin pages except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('fj_admin_token')?.value;
    const roleCookie = request.cookies.get('fj_role')?.value;
    const isTokenValid = adminToken ? await verifyAdminToken(adminToken) : false;

    // Must have a valid signed admin token (or matching role during development)
    const isAuthorized =
      isTokenValid || (process.env.NODE_ENV !== 'production' && roleCookie === 'admin');

    if (!isAuthorized) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Add security headers
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
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};