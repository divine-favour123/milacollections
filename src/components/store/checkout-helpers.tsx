'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/components/store/cart-provider';
import { Button } from '@/components/ui/button';

/** Empties the cart once we know the order is paid. */
export function ClearCartOnPaid() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    if (hydrated) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  return null;
}

/** While Paystack is still confirming, re-check every few seconds for a short while. */
export function PendingRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 8) clearInterval(t);
    }, 4000);
    return () => clearInterval(t);
  }, [router]);
  return (
    <Button variant="outline" onClick={() => router.refresh()}>
      <RefreshCw className="size-4" aria-hidden /> Check again
    </Button>
  );
}
