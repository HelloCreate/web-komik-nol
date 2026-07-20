import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil data cookie sesi login admin
  const session = request.cookies.get('admin_session')?.value;
  const { pathname } = request.nextUrl;

  // Jika mencoba masuk ke /admin atau /upload tapi BELUM LOGIN, lempar ke halaman login
  if ((pathname.startsWith('/admin') || pathname.startsWith('/upload')) && session !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan mencoba ke halaman login lagi, arahkan langsung ke admin
  if (pathname.startsWith('/login') && session === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Aturan halaman mana saja yang wajib dijaga ketat oleh satpam middleware ini
export const config = {
  matcher: ['/admin/:path*', '/upload/:path*', '/login'],
};