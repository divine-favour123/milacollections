import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-1 text-slate">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className, as: Tag = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn('rounded-2xl border border-line bg-paper p-5 sm:p-6', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">{children}</h2>
      {hint ? <p className="mt-0.5 text-sm text-slate">{hint}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: { label: string; value: string; hint?: string; tone?: 'default' | 'gold' }) {
  return (
    <div className={cn('rounded-2xl border p-4 sm:p-5', tone === 'gold' ? 'border-gold/30 bg-gold-soft' : 'border-line bg-paper')}>
      <p className="text-sm text-slate">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-[0.8125rem] text-slate">{hint}</p> : null}
    </div>
  );
}
