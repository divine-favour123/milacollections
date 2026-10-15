import type { Metadata } from 'next';
import { Camera, Lock, Truck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { ProductGallery } from '@/components/store/product-gallery';
import { ProductGrid } from '@/components/store/product-card';
import { ProductPurchase } from '@/components/store/product-purchase';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { Price } from '@/components/ui/price';
import { getProductBySlug, getRelated } from '@/lib/data';
import { absoluteUrl, site } from '@/lib/site';

export const revalidate = 120;

type Params = Promise<{ slug: string }>;

// Render product pages on first visit, then cache them (refreshed every 2 minutes or when the admin saves).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found', robots: { index: false } };
  const description =
    (product.description?.replace(/\s+/g, ' ').trim().slice(0, 155)) ||
    `Buy ${product.name} from ${site.name}. Delivery across Nigeria.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: product.name, description, images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product, 4);
  const paragraphs = (product.description ?? '').split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);
  const url = absoluteUrl(`/product/${product.slug}`);

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    ...(product.category ? [{ name: product.category.name, href: `/shop?category=${product.category.slug}` }] : []),
    { name: product.name, href: `/product/${product.slug}` },
  ];

  return (
    <div className="container-page pt-6 pb-32 lg:pt-10 lg:pb-8">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: paragraphs.join(' ') || product.name,
            image: product.images,
            sku: product.id,
            url,
            brand: { '@type': 'Brand', name: site.name },
            ...(product.category ? { category: product.category.name } : {}),
            offers: {
              '@type': 'Offer',
              url,
              priceCurrency: 'NGN',
              price: product.price.toFixed(2),
              availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@type': 'Organization', name: site.name },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="line-clamp-1 font-medium text-ink">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-ink hover:underline">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <Link href={`/shop?category=${product.category.slug}`} className="text-xs tracking-[0.12em] text-gold-deep uppercase hover:underline">
                {product.category.name}
              </Link>
            ) : null}
            {product.is_customizable ? <Badge tone="gold">Made with your photo</Badge> : null}
            {!product.in_stock ? <Badge tone="ink">Sold out</Badge> : null}
          </div>

          <h1 className="mt-2 font-display text-[2rem] leading-tight tracking-[0.01em] sm:text-4xl lg:text-[2.6rem]">{product.name}</h1>
          <Price amount={product.price} compareAt={product.compare_at_price} className="mt-3 text-2xl" />
          {product.is_customizable && product.back_side_price > 0 ? (
            <p className="mt-1 text-sm text-slate">Photo on the back adds {`₦${product.back_side_price.toLocaleString('en-US')}`} per piece.</p>
          ) : null}

          {paragraphs.length ? (
            <div className="mt-5 space-y-3 text-slate sm:text-[1.0625rem]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-8 space-y-3 border-t border-line pt-6 text-[0.9375rem] text-slate">
            <li className="flex items-center gap-3"><Truck className="size-5 shrink-0 text-gold-deep" aria-hidden /> Delivery across Nigeria, fee shown at checkout</li>
            <li className="flex items-center gap-3"><Lock className="size-5 shrink-0 text-gold-deep" aria-hidden /> Secure payment with Paystack</li>
            {product.is_customizable ? (
              <li className="flex items-center gap-3"><Camera className="size-5 shrink-0 text-gold-deep" aria-hidden /> Made to order from the photos you upload</li>
            ) : null}
          </ul>
        </div>
      </div>

      {related.length ? (
        <section aria-label="You may also like" className="mt-24">
          <SectionHeading title="You may also like" className="mb-10" />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
