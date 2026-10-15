import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { CategoryTile } from '@/components/store/category-tile';
import { Hero } from '@/components/store/hero';
import { ProductGrid } from '@/components/store/product-card';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { getBestSellers, getCategories, getRecommended, getSettings } from '@/lib/data';
import { absoluteUrl, site } from '@/lib/site';

export const revalidate = 120;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [categories, best, settings] = await Promise.all([getCategories(), getBestSellers(8), getSettings()]);
  const picks = await getRecommended(4, best.items.map((p) => p.id));

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'JewelryStore',
            name: site.name,
            url: site.url,
            logo: absoluteUrl('/logo.png'),
            image: absoluteUrl('/logo.png'),
            description: site.description,
            priceRange: '₦₦',
            areaServed: { '@type': 'Country', name: 'Nigeria' },
            ...(settings.email ? { email: settings.email } : {}),
            ...(settings.phone ? { telephone: settings.phone } : {}),
            ...(settings.address ? { address: { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'NG' } } : {}),
            sameAs: [settings.instagram, settings.tiktok].filter(Boolean),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: site.name,
            url: site.url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${site.url}/shop?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />

      <Hero imageUrl={settings.hero_image_url} />

      {categories.length > 0 ? (
        <section aria-labelledby="cats-title" className="container-page pt-20 lg:pt-28">
          <SectionHeading title="Shop by category" as="h2" className="mb-10" />
          <h2 id="cats-title" className="sr-only">Categories</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <CategoryTile category={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Best sellers" className="container-page pt-20 lg:pt-28">
        <SectionHeading title={best.hasSales ? 'Best sellers' : 'New arrivals'} className="mb-10" />
        {best.items.length > 0 ? (
          <>
            <ProductGrid products={best.items.slice(0, 8)} priorityCount={4} />
            <div className="mt-12 text-center">
              <ButtonLink href="/shop" variant="outline">View all jewelry</ButtonLink>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-md border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-display text-2xl">New pieces are on their way.</p>
            <p className="mt-2 text-slate">Message us and we&rsquo;ll show you what&rsquo;s available today.</p>
            <ButtonLink href="/contact" className="mt-6">Contact us</ButtonLink>
          </div>
        )}
      </section>

      <section aria-labelledby="custom-title" className="container-page pt-20 lg:pt-28">
        <div className="border border-gold/50 p-2">
          <div className="bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <h2 id="custom-title" className="mx-auto max-w-2xl font-display text-3xl leading-tight sm:text-5xl">
              Your photo, set in a pendant.
            </h2>
            <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-gold" />
            <p className="mx-auto mt-5 max-w-lg text-white/75 sm:text-lg">
              Pick a pendant, upload your photo for the front, or the front and back, and we make it for you.
            </p>
            <ButtonLink href="/shop?custom=1" size="lg" variant="gold" className="mt-9">See photo pendants</ButtonLink>
          </div>
        </div>
      </section>

      {picks.length > 0 ? (
        <section aria-label="Products you may like" className="container-page pt-20 lg:pt-28">
          <SectionHeading title="You may also like" className="mb-10" />
          <ProductGrid products={picks} />
        </section>
      ) : null}
    </>
  );
}
