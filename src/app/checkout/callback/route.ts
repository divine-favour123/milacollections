import { NextResponse, type NextRequest } from 'next/server';
import { settleOrderByReference } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/** Paystack sends the customer back here after they pay (or cancel). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
  if (!reference || !/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) {
    return NextResponse.redirect(new URL('/checkout', url));
  }
  try {
    const result = await settleOrderByReference(reference);
    if (result.status === 'not_found') return NextResponse.redirect(new URL('/checkout', url));
  } catch (e) {
    // The webhook will still settle the order; the success page explains the "confirming" state.
    console.error('[checkout/callback]', (e as Error).message);
  }
  return NextResponse.redirect(new URL(`/checkout/success?ref=${encodeURIComponent(reference)}`, url));
}
