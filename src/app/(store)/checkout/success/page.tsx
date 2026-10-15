import type { Metadata } from 'next';
import { CircleCheck, Clock, CircleX } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ClearCartOnPaid, PendingRefresh } from '@/components/store/checkout-helpers';
import { ButtonLink } from '@/components/ui/button';
import { requireUser } from '@/lib/auth';
import { formatNaira, orderRef } from '@/lib/utils';
import type { Order } from '@/types';

export const metadata: Metadata = { title: 'Order confirmation', robots: { index: false, follow: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const { supabase } = await requireUser(`/checkout/success?ref=${ref ?? ''}`);
  if (!ref) redirect('/account');

  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('paystack_reference', ref).maybeSingle();
  if (!data) redirect('/account');
  const order = data as Order;
  const paid = order.payment_status === 'paid';
  const failed = order.payment_status === 'failed';

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto max-w-xl text-center">
        {paid ? <ClearCartOnPaid /> : null}
        <span
          className={`mx-auto mb-6 grid size-20 place-items-center rounded-full ${paid ? 'bg-success-soft text-success' : failed ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'}`}
        >
          {paid ? <CircleCheck className="size-10" aria-hidden /> : failed ? <CircleX className="size-10" aria-hidden /> : <Clock className="size-10" aria-hidden />}
        </span>
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {paid ? 'Thank you, your order is in.' : failed ? 'Your payment did not go through.' : 'Confirming your payment…'}
        </h1>
        <p className="mt-4 text-lg text-slate">
          {paid
            ? `Order ${orderRef(order.order_number)} is confirmed. A receipt has been sent to ${order.customer_email} by Paystack, and you can follow progress from your account.`
            : failed
              ? 'You have not been charged for this order. Your cart is still saved, so you can try again.'
              : 'Paystack is still confirming your payment. This usually takes a few seconds. If money left your account, do not pay again, this page will update.'}
        </p>

        <div className="mt-8 rounded-3xl bg-frost p-6 text-left">
          <div className="flex items-baseline justify-between">
            <span className="text-slate">Order</span>
            <span className="font-semibold">{orderRef(order.order_number)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-slate">Total</span>
            <span className="text-lg font-semibold tabular-nums">{formatNaira(order.total)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-slate">Delivering to</span>
            <span className="max-w-[60%] text-right font-medium">{order.city}, {order.state}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {paid ? (
            <>
              <ButtonLink href={`/account/orders/${order.id}`} size="lg">Track my order</ButtonLink>
              <ButtonLink href="/shop" size="lg" variant="outline">Keep shopping</ButtonLink>
            </>
          ) : failed ? (
            <ButtonLink href="/checkout" size="lg">Try again</ButtonLink>
          ) : (
            <PendingRefresh />
          )}
        </div>
      </div>
    </div>
  );
}
