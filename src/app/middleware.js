import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/app'];
const PUBLIC_ROUTE = '/login';

export function middleware(request) {
  const authCookie = request.cookies.get('team_auth');
  const pathname = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If the user is on a protected route and has no auth cookie, redirect to login
  if (isProtectedRoute && !authCookie) {
    const loginUrl = new URL(PUBLIC_ROUTE, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is on the login page and already has an auth cookie, redirect to dashboard
  if (pathname === PUBLIC_ROUTE && authCookie) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}