import { Check } from 'lucide-react';
import { STATUS_STEPS } from '@/lib/order-status';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const LABELS: Partial<Record<OrderStatus, string>> = {
  received: 'Received',
  in_production: 'Preparing',
  shipped: 'On its way',
  delivered: 'Delivered',
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
      {STATUS_STEPS.map((s, i) => {
        const done = current >= i;
        return (
          <li key={s} className="flex flex-col items-center text-center" aria-current={current === i ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done ? 'bg-ink' : 'bg-line-strong')} />
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold',
                  done ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper text-mist',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn('h-0.5 flex-1', i === STATUS_STEPS.length - 1 ? 'bg-transparent' : current > i ? 'bg-ink' : 'bg-line-strong')} />
            </div>
            <span className={cn('mt-2 text-xs font-semibold sm:text-sm', done ? 'text-ink' : 'text-mist')}>{LABELS[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}
