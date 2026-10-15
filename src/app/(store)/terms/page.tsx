import type { Metadata } from 'next';
import { PageShell, Prose } from '@/components/store/page-shell';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'The terms that apply when you shop at Mila Collections, including custom photo orders and payments.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of service" intro="The basics of shopping with us.">
      <Prose>
        <h2>Orders and prices</h2>
        <p>Prices are shown in Nigerian naira (₦). Your final price, including delivery, is shown before you pay. An order is confirmed once your payment is received.</p>
        <h2>Custom photo pieces</h2>
        <p>Custom pieces are made to order from the photos you upload. You confirm that you own the photos or have permission to use them, and that they do not contain anything unlawful. We may contact you if a photo is not suitable.</p>
        <h2>Delivery</h2>
        <p>We deliver across Nigeria. Delivery times depend on your location and whether your order is made to order. See our <a href="/shipping-returns">delivery and returns</a> page.</p>
        <h2>Returns</h2>
        <p>Our <a href="/shipping-returns">returns policy</a> explains what happens if there is a problem with your order.</p>
        <h2>Accounts</h2>
        <p>You are responsible for keeping your login details safe. Tell us straight away if you think someone else has used your account.</p>
        <h2>Contact</h2>
        <p>Questions about these terms? <a href="/contact">Contact us</a>.</p>
      </Prose>
    </PageShell>
  );
}
