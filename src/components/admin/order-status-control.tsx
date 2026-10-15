'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateOrderStatus } from '@/app/admin/actions';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { ADMIN_STATUS_OPTIONS, STATUS_META } from '@/lib/order-status';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export function OrderStatusControl({ orderId, status, paid }: { orderId: string; status: OrderStatus; paid: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState<OrderStatus>(status);

  function change(next: OrderStatus) {
    if (next === optimistic) return;
    const prev = optimistic;
    setOptimistic(next);
    start(async () => {
      const res = await updateOrderStatus(orderId, next);
      if (!res.ok) {
        setOptimistic(prev);
        toast.error(res.error);
      } else {
        toast.success(`Marked as ${STATUS_META[next].label.toLowerCase()}`);
        router.refresh();
      }
    });
  }

  const steps = ADMIN_STATUS_OPTIONS.filter((s) => s !== 'cancelled');

  return (
    <div className={cn('space-y-2', pending && 'opacity-70')}>
      {!paid ? <p className="rounded-xl bg-warn-soft px-3 py-2 text-sm font-medium text-warn">This order has not been paid, so it can only be cancelled.</p> : null}
      <div role="radiogroup" aria-label="Order status" className="grid gap-2">
        {steps.map((s) => {
          const active = optimistic === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!paid || pending}
              onClick={() => change(s)}
              className={cn(
                'flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed',
                active ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper hover:border-ink disabled:opacity-50',
              )}
            >
              <span>
                <span className="block font-semibold">{STATUS_META[s].label}</span>
                <span className={cn('block text-[0.8125rem]', active ? 'text-white/70' : 'text-slate')}>{STATUS_META[s].hint}</span>
              </span>
              {active ? <Check className="size-5 shrink-0" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
      {optimistic !== 'cancelled' ? (
        <ConfirmButton
          title="Cancel this order?"
          description="The customer will see the order as cancelled. This does not refund the payment automatically, so refund on Paystack if needed."
          confirmLabel="Cancel order"
          onConfirm={async () => change('cancelled')}
          variant="ghost"
          className="w-full text-danger hover:bg-danger-soft"
        >
          Cancel order
        </ConfirmButton>
      ) : (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-center text-sm font-semibold text-danger">This order is cancelled</p>
      )}
    </div>
  );
}
