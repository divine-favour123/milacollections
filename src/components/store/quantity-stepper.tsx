'use client';

import { Minus, Plus } from 'lucide-react';
import { MAX_QTY } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function QuantityStepper({
  value,
  onChange,
  size = 'md',
  label = 'Quantity',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const btn = cn(
    'grid place-items-center rounded-sm text-ink transition-colors hover:bg-frost-deep disabled:opacity-40 disabled:hover:bg-transparent',
    size === 'sm' ? 'size-8' : 'size-10',
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex items-center rounded-sm border border-line-strong bg-paper', size === 'sm' ? 'p-0.5' : 'p-1')}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className={cn('text-center font-semibold tabular-nums', size === 'sm' ? 'w-8 text-sm' : 'w-10')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Increase quantity">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
