import type { Metadata } from 'next';
import { PageShell, Prose } from '@/components/store/page-shell';

export const metadata: Metadata = {
  title: 'Delivery and returns',
  description: 'How Mila Collections delivers across Nigeria, and how returns and problems with an order are handled.',
  alternates: { canonical: '/shipping-returns' },
};

export default function ShippingReturnsPage() {
  return (
    <PageShell title="Delivery and returns">
      <Prose>
        <h2>Delivery</h2>
        <p>We deliver across Nigeria. Your delivery fee is shown in your cart and at checkout before you pay. Some orders may qualify for free delivery.</p>
        <p>Custom photo pieces are made to order, so they take longer than items we already have ready. We will confirm your delivery timeline once your order is received. You can follow your order&rsquo;s progress in your account.</p>
        <h2>Returns and problems</h2>
        <p>If your order arrives damaged, or is not what you ordered, contact us as soon as you receive it with your order number and a photo of the problem, and we will make it right.</p>
        <p>Because custom photo pieces are made specifically for you, we cannot accept returns on them unless there is a fault or we made a mistake.</p>
        <h2>Cancelling an order</h2>
        <p>If you need to cancel or change an order, <a href="/contact">contact us</a> as soon as possible. If your order has not been made or shipped yet, we will do our best to help.</p>
        <h2>Payments and refunds</h2>
        <p>Payments are processed by Paystack. If a refund is agreed, it is sent back to the payment method you used.</p>
      </Prose>
    </PageShell>
  );
}
