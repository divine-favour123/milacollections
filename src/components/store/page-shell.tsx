import type { ReactNode } from 'react';

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div>
      <header className="bg-ink text-white">
        <div className="container-page py-14 text-center sm:py-20">
          <h1 className="font-display text-4xl leading-tight tracking-[0.02em] sm:text-5xl">{title}</h1>
          <span aria-hidden className="mx-auto mt-5 block h-px w-14 bg-gold" />
          {intro ? <p className="mx-auto mt-5 max-w-xl text-white/70 sm:text-lg">{intro}</p> : null}
        </div>
      </header>
      <div className="container-page py-12 lg:py-16">{children}</div>
    </div>
  );
}
