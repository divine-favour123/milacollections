import { Loader2 } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

export function OrderSummary({
  subtotal,
  deliveryFee,
  total,
  loading,
  freeDeliveryThreshold,
}: {
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  loading?: boolean;
  freeDeliveryThreshold?: number | null;
}) {
  const remaining =
    freeDeliveryThreshold && deliveryFee && deliveryFee > 0 && subtotal < freeDeliveryThreshold ? freeDeliveryThreshold - subtotal : 0;
  return (
    <dl className="space-y-3 text-[0.9375rem]">
      <div className="flex justify-between">
        <dt className="text-slate">Subtotal</dt>
        <dd className="font-medium tabular-nums">{formatNaira(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-slate">Delivery</dt>
        <dd className="font-medium tabular-nums">
          {deliveryFee == null ? '–' : deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee)}
        </dd>
      </div>
      {remaining > 0 ? (
        <p className="rounded-xl bg-gold-soft px-3 py-2 text-[0.8125rem] text-gold-deep">
          Add {formatNaira(remaining)} more to get free delivery.
        </p>
      ) : null}
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <dt className="text-base font-semibold">Total</dt>
        <dd className="flex items-center gap-2 text-xl font-semibold tabular-nums">
          {loading ? <Loader2 className="size-4 animate-spin text-slate" aria-label="Updating" /> : null}
          {formatNaira(total)}
        </dd>
      </div>
    </dl>
  );
}
