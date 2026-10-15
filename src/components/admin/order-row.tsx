import { Camera, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PAYMENT_META, STATUS_META } from '@/lib/order-status';
import { formatNaira, orderRef, timeAgo } from '@/lib/utils';
import type { Order } from '@/types';

export type OrderRowData = Pick<Order, 'id' | 'order_number' | 'status' | 'payment_status' | 'total' | 'customer_name' | 'created_at'> & {
  order_items?: { is_custom: boolean; quantity: number }[];
};

export function OrderRow({ order }: { order: OrderRowData }) {
  const meta = STATUS_META[order.status];
  const hasCustom = order.order_items?.some((i) => i.is_custom);
  const pieces = order.order_items?.reduce((n, i) => n + i.quantity, 0) ?? 0;
  return (
    <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-ink active:bg-frost">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-semibold">{orderRef(order.order_number)}</span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
          {order.payment_status !== 'paid' ? <Badge tone={PAYMENT_META[order.payment_status].tone}>{PAYMENT_META[order.payment_status].label}</Badge> : null}
          {hasCustom ? (
            <Badge tone="gold"><Camera className="size-3" aria-hidden /> Photos</Badge>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-slate">
          {order.customer_name}{pieces ? ` · ${pieces} ${pieces === 1 ? 'piece' : 'pieces'}` : ''} · {timeAgo(order.created_at)}
        </p>
      </div>
      <span className="font-semibold tabular-nums">{formatNaira(order.total)}</span>
      <ChevronRight className="size-5 shrink-0 text-mist" aria-hidden />
    </Link>
  );
}
