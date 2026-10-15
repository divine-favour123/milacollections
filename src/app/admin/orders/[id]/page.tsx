import type { Metadata } from 'next';
import { ArrowLeft, Download, Mail, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderStatusControl } from '@/components/admin/order-status-control';
import { Card, CardTitle } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth';
import { toWhatsappDigits } from '@/lib/lagos';
import { PAYMENT_META, STATUS_META } from '@/lib/order-status';
import { site } from '@/lib/site';
import { formatDate, formatNaira, orderRef } from '@/lib/utils';
import type { Order } from '@/types';

export const metadata: Metadata = { title: 'Order' };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!data) notFound();
  const order = data as Order;
  const items = order.order_items ?? [];

  // Private customer photos: create short-lived links for viewing and downloading.
  const paths = [...new Set(items.flatMap((i) => [i.front_photo_path, i.back_photo_path]).filter(Boolean) as string[])];
  const view = new Map<string, string>();
  const download = new Map<string, string>();
  if (paths.length) {
    const bucket = supabase.storage.from(site.buckets.customerPhotos);
    const [v, d] = await Promise.all([bucket.createSignedUrls(paths, 3600), bucket.createSignedUrls(paths, 3600, { download: true })]);
    v.data?.forEach((r) => r.path && r.signedUrl && view.set(r.path, r.signedUrl));
    d.data?.forEach((r) => r.path && r.signedUrl && download.set(r.path, r.signedUrl));
  }

  const meta = STATUS_META[order.status];
  const wa = `https://wa.me/${toWhatsappDigits(order.customer_phone)}?text=${encodeURIComponent(`Hello ${order.customer_name.split(' ')[0]}, this is Milla Collections about your order ${orderRef(order.order_number)}.`)}`;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Order {orderRef(order.order_number)}</h1>
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <Badge tone={PAYMENT_META[order.payment_status].tone}>{PAYMENT_META[order.payment_status].label}</Badge>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card>
            <CardTitle hint={`Placed ${formatDate(order.created_at, true)}`}>Items</CardTitle>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-frost sm:size-20">
                      {item.product_image ? <Image src={item.product_image} alt={item.product_name} fill sizes="80px" className="object-cover" /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="font-semibold tabular-nums">{formatNaira(item.line_total)}</p>
                      </div>
                      <p className="text-sm text-slate">
                        {formatNaira(item.unit_price)} × {item.quantity}
                      </p>
                      {item.options?.length ? (
                        <p className="mt-1 text-sm">{item.options.map((o) => `${o.name}: ${o.value}`).join(' · ')}</p>
                      ) : null}
                    </div>
                  </div>

                  {item.is_custom ? (
                    <div className="mt-4 rounded-2xl bg-gold-soft/70 p-4">
                      <p className="mb-3 text-sm font-semibold text-gold-deep">
                        Custom photo · {item.custom_sides === 'front_and_back' ? 'Front and back' : 'Front only'} · make {item.quantity}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['Front', item.front_photo_path],
                          ['Back', item.back_photo_path],
                        ] as const).map(([label, path]) =>
                          path ? (
                            <figure key={label}>
                              <a href={view.get(path)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl bg-paper">
                                {view.get(path) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={view.get(path)} alt={`${label} photo`} className="aspect-square w-full object-cover" loading="lazy" />
                                ) : (
                                  <span className="grid aspect-square place-items-center text-sm text-slate">Photo unavailable</span>
                                )}
                              </a>
                              <figcaption className="mt-2 flex items-center justify-between text-sm">
                                <span className="font-semibold">{label}</span>
                                {download.get(path) ? (
                                  <a href={download.get(path)} className="inline-flex items-center gap-1 font-semibold text-gold-deep hover:underline">
                                    <Download className="size-3.5" aria-hidden /> Download
                                  </a>
                                ) : null}
                              </figcaption>
                            </figure>
                          ) : null,
                        )}
                      </div>
                      {item.custom_note ? (
                        <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm">
                          <span className="font-semibold">Customer note: </span>
                          {item.custom_note}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle>Payment</CardTitle>
            <dl className="space-y-2 text-[0.9375rem]">
              <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd className="tabular-nums">{formatNaira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate">Delivery</dt><dd className="tabular-nums">{order.delivery_fee ? formatNaira(order.delivery_fee) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatNaira(order.total)}</dd></div>
            </dl>
            <p className="mt-4 text-[0.8125rem] break-all text-slate">
              Paystack reference: {order.paystack_reference ?? '–'}
              {order.paid_at ? ` · Paid ${formatDate(order.paid_at, true)}` : ''}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Update status</CardTitle>
            <OrderStatusControl orderId={order.id} status={order.status} paid={order.payment_status === 'paid'} />
          </Card>

          <Card>
            <CardTitle>Customer</CardTitle>
            <p className="font-semibold">{order.customer_name}</p>
            <p className="text-slate">{order.customer_phone}</p>
            <p className="text-slate break-all">{order.customer_email}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a href={`tel:${order.customer_phone.replace(/\s/g, '')}`} className="flex h-12 flex-col items-center justify-center rounded-xl bg-frost text-xs font-semibold hover:bg-frost-deep">
                <Phone className="mb-0.5 size-4" aria-hidden /> Call
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-col items-center justify-center rounded-xl bg-frost text-xs font-semibold hover:bg-frost-deep">
                <MessageCircle className="mb-0.5 size-4" aria-hidden /> WhatsApp
              </a>
              <a href={`mailto:${order.customer_email}`} className="flex h-12 flex-col items-center justify-center rounded-xl bg-frost text-xs font-semibold hover:bg-frost-deep">
                <Mail className="mb-0.5 size-4" aria-hidden /> Email
              </a>
            </div>
          </Card>

          <Card>
            <CardTitle>Deliver to</CardTitle>
            <p>{order.address}</p>
            <p className="text-slate">{order.city}, {order.state}</p>
            {order.delivery_note ? <p className="mt-3 rounded-xl bg-frost px-3 py-2 text-sm">Note: {order.delivery_note}</p> : null}
          </Card>
        </div>
      </div>
    </>
  );
}
