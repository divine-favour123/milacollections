'use client';

import { Gem, Inbox, LayoutDashboard, LogOut, MoreHorizontal, Package, Settings, Store, Tags, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Logo } from '@/components/store/logo';
import { Drawer } from '@/components/ui/drawer';
import { createClient } from '@/lib/supabase/client';
import { cn, initials } from '@/lib/utils';

type Counts = { newOrders: number; unreadMessages: number };

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: Package, badge: 'newOrders' as const },
  { href: '/admin/products', label: 'Products', icon: Gem },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Inbox, badge: 'unreadMessages' as const },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const TABS = ['/admin', '/admin/orders', '/admin/products', '/admin/categories'];

async function signOut() {
  await createClient().auth.signOut();
  window.location.href = '/admin/login';
}

export function AdminShell({ name, counts, children }: { name: string; counts: Counts; children: ReactNode }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const moreActive = !TABS.some((t) => isActive(t, t === '/admin'));

  const Badge = ({ n }: { n: number }) =>
    n > 0 ? <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs leading-5 font-bold text-ink">{n > 99 ? '99+' : n}</span> : null;

  return (
    <div className="min-h-dvh bg-frost lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
          <Logo size={88} className="size-14" />
          <span>
            <span className="block font-display text-lg leading-tight">Mila Collections</span>
            <span className="block text-xs text-white/55">Admin panel</span>
          </span>
        </Link>
        <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href, n.exact) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors',
                isActive(n.href, n.exact) ? 'bg-gold text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <n.icon className="size-5" aria-hidden />
              {n.label}
              {n.badge ? <Badge n={counts[n.badge]} /> : null}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="grid size-9 place-items-center rounded-full border border-gold text-xs font-bold text-gold-light">{initials(name)}</span>
            <span className="min-w-0 truncate text-sm font-semibold">{name}</span>
          </div>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white">
            <Store className="size-5" aria-hidden /> View store
          </Link>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-5" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo size={72} className="size-12" />
          <span className="font-display text-lg">Admin</span>
        </Link>
        <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-white/30 px-3.5 text-sm font-medium">
          <Store className="size-4" aria-hidden /> Store
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] shadow-bar lg:hidden">
        {NAV.filter((n) => TABS.includes(n.href)).map((n) => {
          const active = isActive(n.href, n.exact);
          const count = n.badge ? counts[n.badge] : 0;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? 'page' : undefined}
              className={cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold', active ? 'text-ink' : 'text-slate')}
            >
              <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', active && 'bg-gold-soft text-gold-deep')}>
                <n.icon className="size-5" aria-hidden />
              </span>
              {n.label}
              {count > 0 ? <span className="absolute top-1.5 right-[22%] size-2.5 rounded-full bg-gold ring-2 ring-paper" aria-label={`${count} new`} /> : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          className={cn('relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold', moreActive ? 'text-ink' : 'text-slate')}
        >
          <span className={cn('grid h-7 w-12 place-items-center rounded-full', moreActive && 'bg-gold-soft text-gold-deep')}>
            <MoreHorizontal className="size-5" aria-hidden />
          </span>
          More
          {counts.unreadMessages > 0 ? <span className="absolute top-1.5 right-[22%] size-2.5 rounded-full bg-gold ring-2 ring-paper" /> : null}
        </button>
      </nav>

      <Drawer open={more} onClose={() => setMore(false)} title="More" side="bottom">
        <div className="space-y-1 px-3 pt-2 pb-6">
          {NAV.filter((n) => !TABS.includes(n.href)).map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMore(false)} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[1.0625rem] font-semibold hover:bg-frost">
              <n.icon className="size-5 text-gold-deep" aria-hidden />
              {n.label}
              {n.badge ? <Badge n={counts[n.badge]} /> : null}
            </Link>
          ))}
          <Link href="/" onClick={() => setMore(false)} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[1.0625rem] font-semibold hover:bg-frost">
            <Store className="size-5 text-gold-deep" aria-hidden /> View store
          </Link>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-[1.0625rem] font-semibold text-danger hover:bg-danger-soft">
            <LogOut className="size-5" aria-hidden /> Sign out
          </button>
        </div>
      </Drawer>
    </div>
  );
}
