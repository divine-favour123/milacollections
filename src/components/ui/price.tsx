import { cn, formatNaira } from '@/lib/utils';

export function Price({
  amount,
  compareAt,
  className,
  strikeClassName,
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
  strikeClassName?: string;
}) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 tabular-nums', className)}>
      <span className="font-semibold">{formatNaira(amount)}</span>
      {onSale ? (
        <span className={cn('text-[0.85em] font-normal text-mist line-through', strikeClassName)}>
          <span className="sr-only">Was </span>
          {formatNaira(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
