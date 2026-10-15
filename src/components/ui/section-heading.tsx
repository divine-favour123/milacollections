import { cn } from '@/lib/utils';

export function SectionHeading({
  title,
  description,
  className,
  as: Tag = 'h2',
}: {
  title: string;
  description?: string;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={cn('mx-auto max-w-2xl text-center', className)}>
      <Tag className="font-display text-3xl leading-[1.15] tracking-[0.01em] sm:text-4xl">{title}</Tag>
      <span aria-hidden className="mx-auto mt-4 block h-px w-12 bg-gold" />
      {description ? <p className="mt-4 text-slate">{description}</p> : null}
    </div>
  );
}
