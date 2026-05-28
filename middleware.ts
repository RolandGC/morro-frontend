import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas accesibles sin autenticación
const publicRoutes = ['/auth/login', '/auth/register', '/'];

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/companies', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de cookies
  const token = request.cookies.get('auth_token')?.value;

  // Si intenta acceder a ruta pública
  if (publicRoutes.includes(pathname)) {
    // Si ya está autenticado y va a login/register, redirigir a dashboard
    if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Si intenta acceder a ruta protegida sin token
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next();
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: [
    /*
     * Excluir:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
