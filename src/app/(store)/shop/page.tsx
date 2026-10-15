import type { Metadata } from 'next';
import { Catalog, PAGE_SIZE } from '@/components/store/catalog';
import { PageShell } from '@/components/store/page-shell';
import { getCategories, getProducts, type ProductSort } from '@/lib/data';

type SP = Promise<{ q?: string; sort?: string; page?: string; custom?: string; category?: string }>;

const SORTS: ProductSort[] = ['newest', 'popular', 'price-asc', 'price-desc'];

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q, sort, page, custom, category } = await searchParams;
  const categories = category ? await getCategories() : [];
  const active = categories.find((c) => c.slug === category);
  const filtered = Boolean(q || sort || custom);
  const p = Number(page) > 1 ? Number(page) : 1;
  const title = q ? `Search results for “${q.slice(0, 40)}”` : custom ? 'Custom photo pendants' : active ? `${active.name} jewelry` : 'Shop jewelry';
  return {
    title,
    description:
      active?.description?.slice(0, 160) ||
      'Browse chains, necklaces, pendants, watches and custom photo pendants from Mila Collections. Delivery across Nigeria.',
    alternates: { canonical: active ? `/shop?category=${active.slug}` : p > 1 && !filtered ? `/shop?page=${p}` : '/shop' },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = (SORTS as string[]).includes(sp.sort ?? '') ? (sp.sort as ProductSort) : 'newest';
  const q = sp.q?.trim().slice(0, 60) || undefined;
  const customOnly = sp.custom === '1';

  const categories = await getCategories();
  const active = categories.find((c) => c.slug === sp.category);
  const { items, total } = await getProducts({ q, sort, page, pageSize: PAGE_SIZE, customOnly, categoryId: active?.id });

  const title = q ? `Results for “${q}”` : customOnly ? 'Custom photo pendants' : active ? active.name : 'Shop';
  const intro = customOnly
    ? 'Pick a pendant, upload your photos and we make it for you.'
    : active
      ? active.description || undefined
      : q
        ? undefined
        : 'Chains, necklaces, pendants and more.';

  return (
    <PageShell title={title} intro={intro}>
      <Catalog
        products={items}
        total={total}
        page={page}
        sort={sort}
        categories={categories}
        params={{ q, sort: sp.sort, custom: sp.custom, category: active?.slug }}
        emptyHint={q ? `We couldn't find anything for “${q}”. Check the spelling or try a broader word like “chain”.` : undefined}
      />
    </PageShell>
  );
}
