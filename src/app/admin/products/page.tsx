import type { Metadata } from 'next';
import { Gem, Pencil, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui';
import { ProductToggles } from '@/components/admin/product-toggles';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { normalizeProduct } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { formatNaira } from '@/lib/utils';

export const metadata: Metadata = { title: 'Products' };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();
  const clean = q?.trim().replace(/[%*,()\\]/g, ' ').slice(0, 60);
  let query = supabase.from('products').select('*, category:categories(id,name,slug)').order('created_at', { ascending: false }).limit(200);
  if (clean) query = query.ilike('name', `%${clean}%`);
  const { data } = await query;
  const products = (data ?? []).map(normalizeProduct);

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything you sell. Tap a status to switch it on or off."
        action={
          <ButtonLink href="/admin/products/new" variant="gold">
            <Plus className="size-4" aria-hidden /> Add product
          </ButtonLink>
        }
      />

      <form action="/admin/products" className="relative mb-5">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate" aria-hidden />
        <input type="search" name="q" defaultValue={q} placeholder="Search products" aria-label="Search products" className="h-12 w-full rounded-full border border-line-strong bg-paper pr-4 pl-12 outline-none focus:border-ink" />
      </form>

      {products.length ? (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-paper p-3.5 sm:p-4">
              <div className="flex gap-3.5">
                <Link href={`/admin/products/${p.id}/edit`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-frost sm:size-24">
                  {p.images[0] ? <Image src={p.images[0]} alt="" fill sizes="96px" className="object-cover" /> : <span className="grid size-full place-items-center text-line-strong"><Gem className="size-7" aria-hidden /></span>}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="line-clamp-2 leading-snug font-semibold hover:underline">{p.name}</Link>
                    <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="grid size-9 shrink-0 place-items-center rounded-full bg-frost hover:bg-frost-deep">
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                  </div>
                  <p className="mt-0.5 text-sm text-slate">
                    <span className="font-semibold text-ink tabular-nums">{formatNaira(p.price)}</span>
                    {p.category ? ` · ${p.category.name}` : ''}
                    {p.sold_count ? ` · ${p.sold_count} sold` : ''}
                  </p>
                  {p.is_customizable ? <Badge tone="gold" className="mt-1.5">Customer photos</Badge> : null}
                </div>
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <ProductToggles id={p.id} values={{ is_active: p.is_active, in_stock: p.in_stock, is_featured: p.is_featured }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={clean ? 'No products match' : 'No products yet'}
          description={clean ? 'Try a different word.' : 'Add your first piece of jewelry to start selling.'}
          action={!clean ? <ButtonLink href="/admin/products/new">Add a product</ButtonLink> : undefined}
        />
      )}
    </>
  );
}
