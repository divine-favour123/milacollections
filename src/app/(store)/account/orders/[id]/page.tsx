import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomPhotoThumb } from '@/components/store/custom-photo-thumb';
import { OrderTimeline } from '@/components/store/order-timeline';
import { Badge } from '@/components/ui/badge';
import { requireUser } from '@/lib/auth';
import { PAYMENT_META, STATUS_META } from '@/lib/order-status';
import { formatDate, formatNaira, orderRef, whatsappLink } from '@/lib/utils';
import { getSettings } from '@/lib/data';
import type { Order } from '@/types';

export const metadata: Metadata = { title: 'Order details', robots: { index: false, follow: false } };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireUser(`/account/orders/${id}`);
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!data) notFound();
  const order = data as Order;
  const settings = await getSettings();
  const meta = STATUS_META[order.status];
  const wa = whatsappLink(settings.whatsapp, `Hello, I'm asking about my order ${orderRef(order.order_number)}.`);

  return (
    <div className="container-page py-8 lg:py-12">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-medium tracking-tight">Order {orderRef(order.order_number)}</h1>
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <Badge tone={PAYMENT_META[order.payment_status].tone}>{PAYMENT_META[order.payment_status].label}</Badge>
      </div>

      {order.status !== 'cancelled' && order.status !== 'pending_payment' ? (
        <section className="mb-8 rounded-3xl bg-frost p-6">
          <OrderTimeline status={order.status} />
          <p className="mt-5 text-center text-slate">{meta.hint}</p>
        </section>
      ) : (
        <p className="mb-8 rounded-2xl bg-frost px-5 py-4 text-slate">{meta.hint}</p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <section aria-labelledby="items-h" className="rounded-3xl border border-line px-5 sm:px-7">
          <h2 id="items-h" className="pt-6 text-lg font-semibold">Items</h2>
          <ul className="divide-y divide-line">
            {(order.order_items ?? []).map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-frost">
                  {item.product_image ? <Image src={item.product_image} alt={item.product_name} fill sizes="80px" className="object-cover" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="font-semibold tabular-nums">{formatNaira(item.line_total)}</p>
                  </div>
                  <p className="text-sm text-slate">
                    {formatNaira(item.unit_price)} × {item.quantity}
                    {item.options?.length ? ` · ${item.options.map((o) => `${o.name}: ${o.value}`).join(' · ')}` : ''}
                  </p>
                  {item.is_custom ? (
                    <div className="mt-2 flex items-center gap-2">
                      {item.front_photo_path ? <CustomPhotoThumb path={item.front_photo_path} label="Front photo" className="size-12" /> : null}
                      {item.back_photo_path ? <CustomPhotoThumb path={item.back_photo_path} label="Back photo" className="size-12" /> : null}
                      <span className="text-sm text-slate">{item.custom_sides === 'front_and_back' ? 'Front and back' : 'Front only'}</span>
                    </div>
                  ) : null}
                  {item.custom_note ? <p className="mt-2 text-sm text-slate">Your note: {item.custom_note}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-frost p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment</h2>
            <dl className="space-y-2 text-[0.9375rem]">
              <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd className="tabular-nums">{formatNaira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">Delivery</dt><dd className="tabular-nums">{order.delivery_fee ? formatNaira(order.delivery_fee) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatNaira(order.total)}</dd></div>
            </dl>
            <p className="mt-3 text-[0.8125rem] text-slate">Placed {formatDate(order.created_at, true)}</p>
          </section>
          <section className="rounded-3xl bg-frost p-6">
            <h2 className="mb-3 text-lg font-semibold">Delivery</h2>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-slate">{order.address}</p>
            <p className="text-slate">{order.city}, {order.state}</p>
            <p className="text-slate">{order.customer_phone}</p>
            {order.delivery_note ? <p className="mt-2 text-sm text-slate">Note: {order.delivery_note}</p> : null}
          </section>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-full border border-line-strong font-semibold transition-colors hover:border-ink">
              Ask about this order on WhatsApp
            </a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
