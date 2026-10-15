import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { checkoutSchema, loadDeliverySettings, priceCart } from '@/lib/pricing';
import { initializeTransaction } from '@/lib/paystack';
import { site } from '@/lib/site';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  // 1. Who is asking?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return fail('Please sign in to check out.', 401);

  // 2. Is the request well formed?
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check your details and try again.');
  const { items, shipping } = parsed.data;

  const admin = createAdminClient();

  try {
    // 3. What does it really cost? (never trust browser prices)
    const settings = await loadDeliverySettings(admin);
    const priced = await priceCart(admin, items, settings, { userId: user.id });
    const bad = priced.lines.find((l) => l.issue);
    if (bad) return fail(`${bad.name}: ${bad.issue}`, 409);
    if (priced.total <= 0) return fail('Your cart total is empty.');

    // 4. Create the order (unpaid)
    const reference = `MC-${crypto.randomBytes(9).toString('hex')}`;
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending_payment',
        payment_status: 'unpaid',
        subtotal: priced.subtotal,
        delivery_fee: priced.deliveryFee,
        total: priced.total,
        customer_name: shipping.fullName,
        customer_email: user.email,
        customer_phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        delivery_note: shipping.note || null,
        paystack_reference: reference,
      })
      .select('id, order_number')
      .single();
    if (orderErr || !order) throw new Error(orderErr?.message ?? 'Could not create the order');

    const { error: itemsErr } = await admin.from('order_items').insert(
      priced.lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        product_name: l.name,
        product_image: l.image,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
        options: l.options,
        is_custom: Boolean(l.custom),
        custom_sides: l.custom?.sides ?? null,
        front_photo_path: l.custom?.frontPath ?? null,
        back_photo_path: l.custom?.backPath ?? null,
        custom_note: l.custom?.note || null,
      })),
    );
    if (itemsErr) {
      await admin.from('orders').delete().eq('id', order.id);
      throw new Error(itemsErr.message);
    }

    // 5. Remember contact details for next time
    await admin.from('profiles').update({ phone: shipping.phone }).eq('id', user.id).is('phone', null);
    await admin.from('profiles').update({ full_name: shipping.fullName }).eq('id', user.id).or('full_name.is.null,full_name.eq.');

    // 6. Ask Paystack for a payment page
    const origin = process.env.NEXT_PUBLIC_SITE_URL ? site.url : new URL(request.url).origin;
    try {
      const tx = await initializeTransaction({
        email: user.email,
        amountKobo: Math.round(priced.total * 100),
        reference,
        callbackUrl: `${origin}/checkout/callback`,
        metadata: { order_id: order.id, order_number: order.order_number, customer_name: shipping.fullName },
      });
      return NextResponse.json({ authorizationUrl: tx.authorization_url, orderId: order.id });
    } catch (e) {
      await admin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
      console.error('[checkout] paystack init failed:', (e as Error).message);
      return fail('We could not start the payment. Please try again in a moment.', 502);
    }
  } catch (e) {
    console.error('[checkout]', (e as Error).message);
    return fail('Something went wrong while placing your order. Please try again.', 500);
  }
}
