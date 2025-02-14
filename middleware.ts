import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica tanto o cookie de desenvolvimento quanto o de produção
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token');
                
  const isAuthenticated = !!token;
  const isPublicPath = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/';
  const isProtectedPath = request.nextUrl.pathname.startsWith('/home') || 
                         request.nextUrl.pathname.startsWith('/consultas') ||
                         request.nextUrl.pathname.startsWith('/casa-do-cidadao') ||
                         request.nextUrl.pathname.startsWith('/cadastro-unico') ||
                         request.nextUrl.pathname.startsWith('/usuarios');

  console.log('Middleware:', {
    path: request.nextUrl.pathname,
    isAuthenticated,
    isPublicPath,
    isProtectedPath
  });

  // Se estiver autenticado e tentar acessar páginas públicas, redireciona para home
  if (isAuthenticated && isPublicPath) {
    console.log('Redirecionando para home (autenticado em rota pública)');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Se não estiver autenticado e tentar acessar páginas protegidas
  if (!isAuthenticated && isProtectedPath) {
    console.log('Redirecionando para login (não autenticado em rota protegida)');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configurar quais caminhos o middleware deve verificar
export const config = {
  matcher: [
    '/',
    '/login',
    '/home/:path*',
    '/consultas/:path*',
    '/casa-do-cidadao/:path*',
    '/cadastro-unico/:path*',
    '/usuarios/:path*'
  ]
}; 