import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

const CUSTOMER_PRIVATE_PREFIXES = ['/account', '/checkout'];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user } = await updateSession(request);

  // The Paystack return URL must work even if the session cookie is missing on return.
  const isPaystackReturn = pathname === '/checkout/callback';

  // Admin has its own sign-in page, kept separate from the customer login below.
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdminRoute && pathname !== '/admin/login' && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const isCustomerPrivate = CUSTOMER_PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isCustomerPrivate && !isPaystackReturn && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*', '/reset-password'],
};
