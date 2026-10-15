import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { Catalog, PAGE_SIZE } from '@/components/store/catalog';
import { getCategories, getCategoryBySlug, getProducts, type ProductSort } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';

type Params = Promise<{ slug: string }>;
type SP = Promise<{ sort?: string; page?: string }>;
const SORTS: ProductSort[] = ['newest', 'popular', 'price-asc', 'price-desc'];

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SP }): Promise<Metadata> {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found', robots: { index: false } };
  const p = Number(page) > 1 ? Number(page) : 1;
  const description =
    category.description?.slice(0, 160) ||
    `Shop ${category.name.toLowerCase()} from Mila Collections. Secure checkout with Paystack and delivery across Nigeria.`;
  return {
    title: `${category.name} jewelry`,
    description,
    alternates: { canonical: p > 1 ? `/category/${slug}?page=${p}` : `/category/${slug}` },
    robots: sort ? { index: false, follow: true } : undefined,
    openGraph: category.image_url ? { images: [category.image_url], title: category.name, description } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const sort = (SORTS as string[]).includes(sp.sort ?? '') ? (sp.sort as ProductSort) : 'newest';
  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    getProducts({ categoryId: category.id, sort, page, pageSize: PAGE_SIZE }),
  ]);

  return (
    <div className="container-page py-8 lg:py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl('/shop') },
            { '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(`/category/${slug}`) },
          ],
        }}
      />
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">{category.name}</h1>
        {category.description ? <p className="mt-2 text-slate sm:text-lg">{category.description}</p> : null}
      </header>
      <Catalog
        basePath={`/category/${slug}`}
        products={items}
        total={total}
        page={page}
        sort={sort}
        categories={categories}
        activeCategory={slug}
        params={{ sort: sp.sort }}
        emptyHint="We are adding pieces to this category soon."
      />
    </div>
  );
}
