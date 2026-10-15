import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/store/logo';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-ink lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(201_162_39/0.28),transparent_62%)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center text-white">
          <Logo size={460} priority className="h-auto w-[min(25rem,80%)]" />
          <p className="mt-10 max-w-sm font-display text-3xl leading-snug">Jewelry made to be remembered.</p>
        </div>
      </aside>
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <Link href="/" className="mb-8 inline-flex self-start rounded-full bg-ink p-1 lg:hidden" aria-label="Back to Mila Collections">
            <Logo size={96} className="size-14" />
          </Link>
          <Link href="/" className="mb-8 hidden self-start text-sm text-slate underline-offset-4 hover:text-ink hover:underline lg:inline-block">
            Back to the store
          </Link>
          <h1 className="font-display text-4xl leading-tight tracking-[0.01em]">{title}</h1>
          {subtitle ? <p className="mt-2 mb-8 text-slate">{subtitle}</p> : <div className="mb-8" />}
          {children}
          {footer ? <div className="mt-8 text-center text-slate">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
