import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register', '/'];

const protectedRoutes = ['/dashboard', '/companies', '/profile', '/select-company',];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de cookies
  const token = request.cookies.get('access_token')?.value;

  // Rutas públicas
  if (publicRoutes.includes(pathname)) {
    if (
      token &&
      (pathname === '/auth/login' || pathname === '/auth/register')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // Rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
