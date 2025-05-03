import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the token
  const token = await getToken({ req: request });

  // 요청된 URL의 경로
  const path = request.nextUrl.pathname;

  // 보호된 경로 목록
  const protectedPaths = ['/dashboard', '/files', '/contacts', '/settings'];
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // 인증 관련 경로
  const isAuthPath = path === '/login' || path === '/register' || path === '/forgot-password';

  // 관리자 페이지 경로 체크
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  }

  // 인증되지 않은 사용자가 보호된 경로에 접근하려는 경우
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // 이미 인증된 사용자가 인증 페이지에 접근하려는 경우
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 적용되는 경로 지정
export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};