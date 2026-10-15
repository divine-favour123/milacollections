import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';

export type SettleResult = {
  status: 'paid' | 'failed' | 'pending' | 'mismatch' | 'not_found';
  orderId?: string;
};

/**
 * Confirms a Paystack payment with Paystack itself, checks the amount matches the order,
 * then marks the order paid. Safe to call many times (callback + webhook both use it).
 */
export async function settleOrderByReference(reference: string): Promise<SettleResult> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, total, payment_status')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (!order) return { status: 'not_found' };
  if (order.payment_status === 'paid') return { status: 'paid', orderId: order.id };

  const tx = await verifyTransaction(reference);

  if (tx.status === 'success') {
    const expected = Math.round(Number(order.total) * 100);
    if (tx.currency !== 'NGN' || tx.amount !== expected) {
      console.error(`[paystack] amount mismatch for ${reference}: got ${tx.amount} ${tx.currency}, expected ${expected} NGN`);
      return { status: 'mismatch', orderId: order.id };
    }
    const { data: ok, error } = await admin.rpc('mark_order_paid', {
      p_order_id: order.id,
      p_reference: reference,
      p_amount_kobo: tx.amount,
    });
    if (error || !ok) {
      console.error('[paystack] mark_order_paid failed:', error?.message);
      return { status: 'pending', orderId: order.id };
    }
    return { status: 'paid', orderId: order.id };
  }

  if (tx.status === 'failed' || tx.status === 'reversed') {
    await admin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id).neq('payment_status', 'paid');
    return { status: 'failed', orderId: order.id };
  }

  return { status: 'pending', orderId: order.id };
}
