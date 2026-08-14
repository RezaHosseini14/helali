import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { REFRESH_TOKEN_COOKIE } from '@helali/shared';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE);
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  // Only block dashboard when there is no refresh cookie.
  // Do NOT auto-redirect login -> dashboard based on cookie presence;
  // an invalid cookie would cause an infinite refresh loop.
  if (isDashboardRoute && !refreshToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard', '/dashboard/:path*'],
};
