import type { Metadata } from 'next';
import { PageShell, Prose } from '@/components/store/page-shell';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Mila Collections collects, uses and protects your personal information and the photos you upload.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy policy" intro="What we collect, why, and how we look after it.">
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>Your name, email address and phone number when you create an account or place an order.</li>
          <li>Your delivery address, so we can deliver your order.</li>
          <li>The photos you upload for custom pieces.</li>
          <li>Messages you send us through the contact form.</li>
        </ul>
        <h2>How we use it</h2>
        <p>We use your information to process and deliver your orders, make custom pieces, contact you about your order and answer your questions. We do not sell your personal information.</p>
        <h2>Your photos</h2>
        <p>Photos you upload are stored privately. Only you and the Mila Collections team can view them, and we use them only to make your order.</p>
        <h2>Payments</h2>
        <p>Payments are handled by Paystack. We do not see or store your card details. We keep a record of your order, its total and the payment reference.</p>
        <h2>Sign in with Google</h2>
        <p>If you choose to continue with Google, we receive your name and email address from Google to create your account. We do not receive your Google password.</p>
        <h2>Your choices</h2>
        <p>You can update your details from your account page. To ask us to delete your account or photos, <a href="/contact">contact us</a>.</p>
      </Prose>
    </PageShell>
  );
}
