import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      footer={<Link href="/login" className="font-semibold text-gold-deep hover:underline">Back to sign in</Link>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
