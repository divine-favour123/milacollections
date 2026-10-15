import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The Mila Collections roundel (transparent PNG, made for dark backgrounds). */
export function Logo({ size = 64, priority = false, className }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Mila Collections"
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0 select-none', className)}
    />
  );
}
