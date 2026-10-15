import { NextResponse } from 'next/server';
import { cartSchema, loadDeliverySettings, priceCart } from '@/lib/pricing';
import { createFreshAnonClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Your cart has an item we could not read. Try removing it and adding it again.' }, { status: 400 });
  }
  try {
    const client = createFreshAnonClient();
    const settings = await loadDeliverySettings(client);
    const priced = await priceCart(client, parsed.data.items, settings);
    return NextResponse.json({ ...priced, freeDeliveryThreshold: settings.free_delivery_threshold });
  } catch (e) {
    console.error('[cart/price]', (e as Error).message);
    return NextResponse.json({ error: 'Could not refresh prices right now.' }, { status: 500 });
  }
}
