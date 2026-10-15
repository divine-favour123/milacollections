import { NextResponse } from 'next/server';
import { settleOrderByReference } from '@/lib/orders';
import { isValidWebhookSignature } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

/** Paystack calls this on its own, so orders get marked paid even if the customer closes the tab. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get('x-paystack-signature'))) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse('Bad payload', { status: 400 });
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    try {
      await settleOrderByReference(event.data.reference);
    } catch (e) {
      console.error('[paystack/webhook]', (e as Error).message);
      return new NextResponse('Retry later', { status: 500 }); // Paystack will retry
    }
  }
  return NextResponse.json({ received: true });
}
