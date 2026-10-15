import type { MetadataRoute } from 'next';
import { getAllSlugsForSitemap } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getAllSlugsForSitemap();
  const now = new Date();
  const staticPages = ['', '/shop', '/about', '/contact'];

  return [
    ...staticPages.map((p) => ({
      url: absoluteUrl(p || '/'),
      lastModified: now,
      changeFrequency: (p === '' || p === '/shop' ? 'daily' : 'monthly') as 'daily' | 'monthly',
      priority: p === '' ? 1 : p === '/shop' ? 0.9 : 0.5,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/shop?category=${c.slug}`),
      lastModified: c.created_at ? new Date(c.created_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: new Date(p.updated_at ?? p.created_at ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
