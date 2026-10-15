import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { ProductGrid } from '@/components/store/product-card';
import { SortSelect } from '@/components/store/sort-select';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn, plural } from '@/lib/utils';
import type { Category, Product } from '@/types';

export const PAGE_SIZE = 12;

export type CatalogParams = { category?: string; custom?: string; q?: string; sort?: string };

function href(params: CatalogParams, page = 1) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  if (page > 1) q.set('page', String(page));
  const s = q.toString();
  return s ? `/shop?${s}` : '/shop';
}

export function Catalog({
  products,
  total,
  page,
  sort,
  categories,
  params,
  emptyHint,
}: {
  products: Product[];
  total: number;
  page: number;
  sort: string;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
  params: CatalogParams;
  emptyHint?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // keep search and sort while moving between categories
  const keep = { q: params.q, sort: params.sort };
  const tabs = [
    { key: 'all', label: 'All', to: href(keep), active: !params.category && !params.custom },
    ...categories.map((c) => ({ key: c.id, label: c.name, to: href({ ...keep, category: c.slug }), active: params.category === c.slug })),
    { key: 'custom', label: 'Custom photo', to: href({ ...keep, custom: '1' }), active: params.custom === '1' },
  ];

  return (
    <div>
      <nav aria-label="Categories" className="-mx-4 mb-8 overflow-x-auto border-b border-line px-4 no-scrollbar sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-8 sm:justify-center">
          {tabs.map((t) => (
            <li key={t.key}>
              <Link
                href={t.to}
                aria-current={t.active ? 'page' : undefined}
                className={cn(
                  'relative block py-3.5 text-[0.8125rem] tracking-[0.14em] whitespace-nowrap uppercase transition-colors',
                  t.active ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-gold' : 'text-slate hover:text-ink',
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form action="/shop" role="search" className="relative sm:w-72">
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          {params.custom ? <input type="hidden" name="custom" value={params.custom} /> : null}
          {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-mist" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Search jewelry"
            aria-label="Search jewelry"
            enterKeyHint="search"
            className="h-11 w-full rounded-sm border border-line-strong bg-paper pr-4 pl-10 text-base transition-colors placeholder:text-mist hover:border-slate focus:border-ink"
          />
        </form>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm text-slate" aria-live="polite">{plural(total, 'piece')}</p>
          <Suspense fallback={null}>
            <SortSelect value={sort} />
          </Suspense>
        </div>
      </div>

      {products.length ? (
        <ProductGrid products={products} priorityCount={4} />
      ) : (
        <EmptyState
          title="Nothing here yet"
          description={emptyHint ?? 'Try another category or search, or message us and we will help you find something.'}
          action={<ButtonLink href="/shop">See all jewelry</ButtonLink>}
        />
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link href={href(params, page - 1)} rel="prev" className="inline-flex h-11 items-center gap-1 rounded-sm border border-ink px-5 text-[0.8125rem] tracking-[0.12em] uppercase hover:bg-ink hover:text-white">
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Link>
          ) : null}
          <span className="text-sm text-slate">Page {page} of {pages}</span>
          {page < pages ? (
            <Link href={href(params, page + 1)} rel="next" className="inline-flex h-11 items-center gap-1 rounded-sm bg-ink px-5 text-[0.8125rem] tracking-[0.12em] text-white uppercase hover:bg-gold hover:text-ink">
              Next <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
