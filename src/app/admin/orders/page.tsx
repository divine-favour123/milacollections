import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { OrderRow, type OrderRowData } from '@/components/admin/order-row';
import { AdminPageHeader } from '@/components/admin/ui';
import { EmptyState } from '@/components/ui/empty-state';
import { requireAdmin } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Orders' };

const FILTERS = [
  { key: 'all', label: 'All paid' },
  { key: 'received', label: 'New' },
  { key: 'in_production', label: 'Preparing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'unpaid', label: 'Unpaid' },
];
const PAGE = 20;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const status = FILTERS.some((f) => f.key === sp.status) ? (sp.status as string) : 'all';
  const q = sp.q?.trim().replace(/[%*,()\\]/g, ' ').slice(0, 50) ?? '';
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, customer_name, created_at, order_items(is_custom, quantity)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status === 'unpaid') query = query.neq('payment_status', 'paid');
  else {
    query = query.eq('payment_status', 'paid');
    if (status !== 'all') query = query.eq('status', status);
  }
  if (q) {
    const digits = q.replace(/\D/g, '');
    query = /^(mc-?)?\d+$/i.test(q) && digits
      ? query.eq('order_number', Number(digits))
      : query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`);
  }
  const { data, count } = await query.range((page - 1) * PAGE, page * PAGE - 1);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: status === 'all' ? undefined : status, q: q || undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ''}`;
  };

  return (
    <>
      <AdminPageHeader title="Orders" description="Tap an order to see photos, delivery details and update its status." />

      <form action="/admin/orders" className="relative mb-4">
        {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search order number, name or phone"
          aria-label="Search orders"
          className="h-12 w-full rounded-full border border-line-strong bg-paper pr-4 pl-12 outline-none focus:border-ink"
        />
      </form>

      <nav aria-label="Filter orders" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={href({ status: f.key === 'all' ? undefined : f.key, page: undefined })}
            aria-current={status === f.key ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              status === f.key ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper hover:border-ink',
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {data?.length ? (
        <div className="space-y-2.5">
          {(data as unknown as OrderRowData[]).map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <EmptyState title="No orders here" description={q ? 'Nothing matched your search.' : 'Orders will appear here once customers pay.'} />
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={href({ page: String(page - 1) })} className="inline-flex h-11 items-center gap-1 rounded-full border border-line-strong bg-paper px-4 font-semibold">
              <ChevronLeft className="size-4" aria-hidden /> Newer
            </Link>
          ) : null}
          <span className="text-sm text-slate">Page {page} of {pages}</span>
          {page < pages ? (
            <Link href={href({ page: String(page + 1) })} className="inline-flex h-11 items-center gap-1 rounded-full bg-ink px-5 font-semibold text-white">
              Older <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
