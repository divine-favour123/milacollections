import type { ReactNode } from 'react';
import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-frost/50 px-6 py-14 text-center', className)}>
      <span className="mb-4 grid size-14 place-items-center rounded-full border border-gold/40 bg-gold-soft text-gold-deep">
        {icon ?? <Gem className="size-6" aria-hidden />}
      </span>
      <h2 className="font-display text-xl">{title}</h2>
      {description ? <p className="mt-1.5 max-w-sm text-slate">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
