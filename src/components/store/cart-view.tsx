'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CartLines } from '@/components/store/cart-lines';
import { useCart } from '@/components/store/cart-provider';
import { OrderSummary } from '@/components/store/order-summary';
import { useCartPricing } from '@/components/store/use-cart-pricing';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export function CartView() {
  const { lines, hydrated, subtotal } = useCart();
  const { data, loading, error, byLineId } = useCartPricing();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="skeleton h-56 rounded-3xl" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" aria-hidden />}
        title="Your cart is empty"
        description="Browse chains, pendants and custom photo pieces and add your favourites."
        action={<ButtonLink href="/shop">Start shopping</ButtonLink>}
      />
    );
  }

  const hasIssues = Boolean(data?.hasIssues);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div className="rounded-3xl border border-line px-5 sm:px-7">
        <CartLines lines={lines} pricing={byLineId} />
      </div>

      <aside aria-label="Order summary" className="rounded-3xl bg-frost p-6 lg:sticky lg:top-28">
        <h2 className="mb-5 text-lg font-semibold">Order summary</h2>
        <OrderSummary
          subtotal={data ? data.subtotal : subtotal}
          deliveryFee={data ? data.deliveryFee : null}
          total={data ? data.total : subtotal}
          loading={loading}
          freeDeliveryThreshold={data?.freeDeliveryThreshold}
        />
        {error ? <p className="mt-3 text-[0.8125rem] text-slate">We couldn&rsquo;t refresh live prices. They&rsquo;ll be confirmed at checkout.</p> : null}
        {hasIssues ? (
          <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            Fix the items marked above before you check out.
          </p>
        ) : null}
        <ButtonLink href="/checkout" size="lg" className={`mt-6 w-full ${hasIssues ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={hasIssues}>
          Checkout
        </ButtonLink>
        <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-gold-deep hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
