import type { Metadata } from 'next';
import { CartView } from '@/components/store/cart-view';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <h1 className="mb-8 font-display text-4xl font-medium tracking-tight sm:text-5xl">Your cart</h1>
      <CartView />
    </div>
  );
}
