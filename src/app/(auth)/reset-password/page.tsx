import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetForm } from '@/components/auth/auth-forms';
import { getSessionUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  const { user } = await getSessionUser();
  return (
    <AuthShell title="Choose a new password" subtitle={user ? 'Pick something you have not used before.' : undefined}>
      {user ? (
        <ResetForm />
      ) : (
        <div className="rounded-3xl bg-frost p-8 text-center">
          <p className="font-semibold">This reset link has expired or was already used.</p>
          <p className="mt-1 text-slate">Request a new one and try again.</p>
          <Link href="/forgot-password" className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-6 font-semibold text-white">
            Send a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
