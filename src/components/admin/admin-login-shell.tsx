import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Deliberately plain and separate from the customer AuthShell:
 * no storefront branding, no signup link, no Google button.
 * This is a staff sign-in screen, not a shop page.
 */
export function AdminLoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-paper p-8">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-frost text-ink">
          <Lock className="size-5" aria-hidden />
        </span>
        <h1 className="text-center font-display text-2xl font-medium tracking-tight">Admin sign in</h1>
        <p className="mt-1.5 text-center text-sm text-slate">Staff access only. Customers should use the regular sign-in page.</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
