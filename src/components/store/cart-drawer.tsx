'use client';

import { ShoppingBag } from 'lucide-react';
import { CartLines } from '@/components/store/cart-lines';
import { useCart } from '@/components/store/cart-provider';
import { ButtonLink } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { formatNaira } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, close, lines, subtotal, count } = useCart();

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={count ? `Your cart (${count})` : 'Your cart'}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-slate">Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">{formatNaira(subtotal)}</span>
            </div>
            <p className="text-[0.8125rem] text-slate">Delivery is calculated at checkout.</p>
            <ButtonLink href="/checkout" size="lg" className="w-full" onClick={close}>
              Checkout
            </ButtonLink>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <div className="px-5">
          <CartLines lines={lines} onNavigate={close} compact />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <span className="mb-4 grid size-16 place-items-center rounded-full border border-gold/40 bg-gold-soft text-gold-deep">
            <ShoppingBag className="size-7" aria-hidden />
          </span>
          <p className="font-display text-2xl">Your cart is empty</p>
          <p className="mt-1 text-slate">Chains, pendants and custom photo pieces are waiting.</p>
          <ButtonLink href="/shop" className="mt-6" onClick={close}>
            Start shopping
          </ButtonLink>
        </div>
      )}
    </Drawer>
  );
}
