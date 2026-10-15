'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/store/cart-provider';
import type { PricedCart } from '@/lib/pricing';

export type CartPricing = PricedCart & { freeDeliveryThreshold: number | null };

/** Asks the server what the cart really costs (prices, delivery, availability). */
export function useCartPricing() {
  const { lines, hydrated } = useCart();
  const [data, setData] = useState<CartPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () =>
      JSON.stringify({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          options: l.options,
          custom: l.custom,
        })),
      }),
    [lines],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!lines.length) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/cart/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || 'Could not refresh prices.');
        setData(json as CartPricing);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return;
        setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, hydrated]);

  /** Server results are index-aligned with the cart lines that were sent. */
  const byLineId = useMemo(() => {
    const map = new Map<string, CartPricing['lines'][number]>();
    if (data && data.lines.length === lines.length) lines.forEach((l, i) => map.set(l.id, data.lines[i]));
    return map;
  }, [data, lines]);

  return { data, loading, error, byLineId };
}
