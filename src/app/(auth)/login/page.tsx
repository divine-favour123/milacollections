import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/auth-forms';
import { safeNext } from '@/lib/utils';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check out faster and follow your orders."
      footer={
        <>
          New here?{' '}
          <Link href={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-gold-deep hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} initialError={sp.error ? 'We could not sign you in with that link. It may have expired. Please try again.' : undefined} />
    </AuthShell>
  );
}
