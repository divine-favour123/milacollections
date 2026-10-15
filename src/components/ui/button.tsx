import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'bg-ink text-white hover:bg-gold hover:text-ink',
  gold: 'bg-gold text-ink hover:bg-gold-light',
  outline: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-white',
  light: 'border border-white/70 bg-transparent text-white hover:bg-white hover:text-ink',
  soft: 'bg-frost text-ink hover:bg-frost-deep',
  ghost: 'text-ink hover:bg-frost',
  danger: 'bg-danger text-white hover:brightness-110',
  'danger-soft': 'bg-danger-soft text-danger hover:brightness-95',
} as const;

const sizes = {
  sm: 'h-9 rounded-sm px-4 text-sm',
  md: 'h-11 rounded-sm px-6 text-[0.8125rem] tracking-[0.12em] uppercase',
  lg: 'h-13 rounded-sm px-9 text-[0.8125rem] tracking-[0.14em] uppercase',
  icon: 'size-10 rounded-sm',
} as const;

type Style = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export const buttonClass = ({ variant = 'primary', size = 'md' }: Style = {}, className?: string) =>
  cn(base, variants[variant], sizes[size], className);

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Style & { loading?: boolean }) {
  return (
    <button type={type} className={buttonClass({ variant, size }, className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Style) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
