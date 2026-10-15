import type { Metadata } from 'next';
import { ChevronRight, LayoutDashboard, Package } from 'lucide-react';
import Link from 'next/link';
import { AddressBook } from '@/components/store/address-book';
import { ProfileForm, SignOutButton } from '@/components/store/account-forms';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { requireUser } from '@/lib/auth';
import { PAYMENT_META, STATUS_META } from '@/lib/order-status';
import { cn, formatDate, formatNaira, orderRef } from '@/lib/utils';
import type { Address, Order } from '@/types';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'details', label: 'My details' },
] as const;

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((t) => t.key === rawTab)?.key ?? 'orders';
  const { supabase, user, profile } = await requireUser(tab === 'orders' ? '/account' : `/account?tab=${tab}`);

  const orders =
    tab === 'orders'
      ? (((
          await supabase
            .from('orders')
            .select('id, order_number, status, payment_status, total, created_at, order_items(product_name, quantity)')
            .neq('status', 'pending_payment')
            .order('created_at', { ascending: false })
            .limit(30)
        ).data ?? []) as unknown as (Order & { order_items: { product_name: string; quantity: number }[] })[])
      : [];

  const addresses =
    tab === 'addresses'
      ? (((
          await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false })
        ).data ?? []) as Address[])
      : [];

  return (
    <div>
      <header className="bg-ink text-white">
        <div className="container-page flex flex-wrap items-end justify-between gap-5 py-12 sm:py-16">
          <div>
            <h1 className="font-display text-4xl tracking-[0.02em] sm:text-5xl">Hello, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="mt-2 text-white/65">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.role === 'admin' ? (
              <ButtonLink href="/admin" variant="gold" size="sm"><LayoutDashboard className="size-4" aria-hidden /> Admin panel</ButtonLink>
            ) : null}
            <SignOutButton />
          </div>
        </div>
        <nav aria-label="Account" className="container-page -mb-px flex gap-8 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === 'orders' ? '/account' : `/account?tab=${t.key}`}
              aria-current={tab === t.key ? 'page' : undefined}
              className={cn(
                'border-b-2 py-3.5 text-[0.8125rem] tracking-[0.14em] whitespace-nowrap uppercase transition-colors',
                tab === t.key ? 'border-gold text-white' : 'border-transparent text-white/55 hover:text-white',
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="container-page max-w-4xl py-10 lg:py-14">
        {tab === 'orders' ? (
          orders.length ? (
            <ul className="space-y-3">
              {orders.map((o) => {
                const meta = STATUS_META[o.status];
                const first = o.order_items[0];
                const extra = o.order_items.length - 1;
                return (
                  <li key={o.id}>
                    <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 border border-line p-4 transition-colors hover:border-ink">
                      <span className="grid size-12 shrink-0 place-items-center bg-frost text-gold-deep">
                        <Package className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold">{orderRef(o.order_number)}</span>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          {o.payment_status !== 'paid' ? <Badge tone={PAYMENT_META[o.payment_status].tone}>{PAYMENT_META[o.payment_status].label}</Badge> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate">
                          {first?.product_name}{extra > 0 ? ` and ${extra} more` : ''} · {formatDate(o.created_at)}
                        </span>
                      </span>
                      <span className="hidden font-semibold tabular-nums sm:block">{formatNaira(o.total)}</span>
                      <ChevronRight className="size-5 shrink-0 text-mist" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No orders yet" description="When you place an order, you can follow it here." action={<ButtonLink href="/shop">Start shopping</ButtonLink>} />
          )
        ) : null}

        {tab === 'addresses' ? (
          <AddressBook userId={user.id} addresses={addresses} defaults={{ name: profile?.full_name ?? '', phone: profile?.phone ?? '' }} />
        ) : null}

        {tab === 'details' ? (
          <div className="max-w-lg">
            <ProfileForm userId={user.id} email={user.email ?? ''} fullName={profile?.full_name ?? ''} phone={profile?.phone ?? ''} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
