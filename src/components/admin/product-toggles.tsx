'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { setProductFlag } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

type Flag = 'is_active' | 'in_stock' | 'is_featured';
const LABELS: Record<Flag, [string, string]> = {
  is_active: ['Visible', 'Hidden'],
  in_stock: ['In stock', 'Sold out'],
  is_featured: ['Featured', 'Not featured'],
};

export function ProductToggles({ id, values }: { id: string; values: Record<Flag, boolean> }) {
  const router = useRouter();
  const [state, setState] = useState(values);
  const [, start] = useTransition();

  function toggle(flag: Flag) {
    const next = !state[flag];
    setState((s) => ({ ...s, [flag]: next }));
    start(async () => {
      const res = await setProductFlag(id, flag, next);
      if (!res.ok) {
        setState((s) => ({ ...s, [flag]: !next }));
        toast.error(res.error);
      } else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(LABELS) as Flag[]).map((f) => (
        <button
          key={f}
          type="button"
          role="switch"
          aria-checked={state[f]}
          onClick={() => toggle(f)}
          className={cn(
            'min-h-9 rounded-full px-3 text-xs font-semibold transition-colors',
            state[f] ? 'bg-success-soft text-success' : 'bg-frost text-slate',
          )}
        >
          {LABELS[f][state[f] ? 0 : 1]}
        </button>
      ))}
    </div>
  );
}
