'use client';

import { LayoutDashboard, LogOut, Menu, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/components/store/cart-provider';
import { Logo } from '@/components/store/logo';
import { Drawer } from '@/components/ui/drawer';
import { cn, initials } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact us' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, open: openCart, hydrated } = useCart();
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const iconBtn = 'relative grid size-11 place-items-center text-white transition-colors hover:text-gold-light';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink">
        <div className="container-page grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center lg:h-24">
          <div className="flex items-center">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={cn(iconBtn, '-ml-2.5 lg:hidden')}>
              <Menu className="size-6" aria-hidden />
            </button>
            <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={cn(
                    'relative py-2 text-[0.8125rem] tracking-[0.14em] text-white/75 uppercase transition-colors hover:text-white',
                    isActive(l.href) && 'text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-gold',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="Mila Collections home" className="justify-self-center">
            <Logo size={96} priority className="size-14 lg:size-[4.75rem]" />
          </Link>

          <div className="flex items-center justify-end">
            <Link href={user ? '/account' : '/login'} aria-label={user ? 'Your account' : 'Sign in'} className={cn(iconBtn, 'hidden sm:grid')}>
              {user ? (
                <span className="grid size-8 place-items-center rounded-full border border-gold text-xs font-bold text-gold-light">
                  {initials(profile?.full_name || user.email)}
                </span>
              ) : (
                <User className="size-5" aria-hidden />
              )}
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart${hydrated && count ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
              className={cn(iconBtn, '-mr-2.5 lg:mr-0')}
            >
              <ShoppingBag className="size-5" aria-hidden />
              {hydrated && count > 0 ? (
                <span key={count} className="absolute top-1 right-0.5 grid min-w-5 animate-pop place-items-center rounded-full bg-gold px-1 text-[0.6875rem] leading-5 font-bold text-ink">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={cn('border-b border-line py-4 font-display text-2xl transition-colors hover:text-gold-deep', isActive(l.href) && 'text-gold-deep')}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-5">
          {user ? (
            <div className="space-y-1">
              <p className="mb-3 text-sm text-slate">
                Signed in as <span className="font-semibold text-ink">{profile?.full_name || user.email}</span>
              </p>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-sm bg-frost px-4 py-3 font-semibold">
                <User className="size-5" aria-hidden /> Account and orders
              </Link>
              {profile?.role === 'admin' ? (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-sm bg-gold-soft px-4 py-3 font-semibold text-gold-deep">
                  <LayoutDashboard className="size-5" aria-hidden /> Admin panel
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center gap-3 px-4 py-3 font-medium text-slate hover:text-ink"
              >
                <LogOut className="size-5" aria-hidden /> Sign out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="grid h-12 place-items-center rounded-sm border border-ink text-[0.8125rem] tracking-[0.12em] uppercase">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="grid h-12 place-items-center rounded-sm bg-ink text-[0.8125rem] tracking-[0.12em] text-white uppercase">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
