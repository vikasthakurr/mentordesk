import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isLoginPage = req.nextUrl.pathname === '/login';
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');
  const isJoinPage = req.nextUrl.pathname.startsWith('/join');

  // Allow auth API and login page without token
  if (isApiAuth) return NextResponse.next();

  // Redirect to login if not authenticated
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to home if already logged in and on login page
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|login|api/auth|favicon.ico|monaco-editor).*)',
  ],
};
