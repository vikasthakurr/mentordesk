import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - never require auth
  const publicPaths = ['/login', '/api/auth', '/join'];
  if (publicPaths.some(p => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|monaco-editor|api/auth).*)',
  ],
};
