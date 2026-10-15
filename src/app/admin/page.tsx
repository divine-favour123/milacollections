import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { OrderRow, type OrderRowData } from '@/components/admin/order-row';
import { AdminPageHeader, Card, StatCard } from '@/components/admin/ui';
import { ButtonLink } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth';
import { lagosGreeting, lagosStartOfDay, lagosStartOfMonth } from '@/lib/lagos';
import { formatNaira } from '@/lib/utils';

export default async function AdminDashboard() {
  const { supabase, profile } = await requireAdmin();
  const monthStart = lagosStartOfMonth().toISOString();
  const dayStart = lagosStartOfDay().toISOString();

  const [month, today, toProcess, unread, recent, products, customers] = await Promise.all([
    supabase.from('orders').select('total').eq('payment_status', 'paid').gte('paid_at', monthStart).limit(5000),
    supabase.from('orders').select('total').eq('payment_status', 'paid').gte('paid_at', dayStart).limit(1000),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid').in('status', ['received', 'in_production']),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, customer_name, created_at, order_items(is_custom, quantity)')
      .neq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ]);

  const sum = (rows: { total: number | string }[] | null) => (rows ?? []).reduce((n, r) => n + Number(r.total), 0);
  const first = profile.full_name?.split(' ')[0];
  const noProducts = (products.count ?? 0) === 0;

  return (
    <>
      <AdminPageHeader
        title={`${lagosGreeting()}${first ? `, ${first}` : ''}`}
        description="Here is how the store is doing."
        action={
          <ButtonLink href="/admin/products/new" variant="gold">
            <Plus className="size-4" aria-hidden /> Add product
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Sales this month" value={formatNaira(sum(month.data))} hint={`${month.data?.length ?? 0} paid orders`} tone="gold" />
        <StatCard label="Sales today" value={formatNaira(sum(today.data))} hint={`${today.data?.length ?? 0} paid orders`} />
        <StatCard label="To make or ship" value={String(toProcess.count ?? 0)} hint="Paid, not yet shipped" />
        <StatCard label="Unread messages" value={String(unread.count ?? 0)} hint={`${customers.count ?? 0} customers`} />
      </div>

      {noProducts ? (
        <Card className="mt-6 border-dashed text-center">
          <h2 className="text-lg font-semibold">Start by adding your first category and product</h2>
          <p className="mx-auto mt-1 max-w-md text-slate">Create a category like &ldquo;Chains&rdquo;, then add jewelry to it. Customers will see them on the store straight away.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ButtonLink href="/admin/categories" variant="outline">Add categories</ButtonLink>
            <ButtonLink href="/admin/products/new">Add a product</ButtonLink>
          </div>
        </Card>
      ) : null}

      <section className="mt-8" aria-labelledby="recent-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-h" className="text-lg font-semibold">Latest orders</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-deep hover:underline">
            See all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {recent.data?.length ? (
          <div className="space-y-2.5">
            {(recent.data as unknown as OrderRowData[]).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <Card className="text-center text-slate">No orders yet. They will show up here as soon as customers pay.</Card>
        )}
      </section>
    </>
  );
}
