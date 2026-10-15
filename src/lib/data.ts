import { createPublicClient } from '@/lib/supabase/public';
import type { Category, Product, ProductOption, StoreSettings } from '@/types';

const PRODUCT_SELECT = '*, category:categories(id,name,slug)';

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  announcement: null,
  whatsapp: null,
  phone: null,
  email: null,
  address: null,
  instagram: null,
  tiktok: null,
  delivery_fee: 0,
  free_delivery_threshold: null,
  hero_image_url: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(row: any): Product {
  const options: ProductOption[] = Array.isArray(row.options)
    ? row.options
        .filter((o: ProductOption) => o && typeof o.name === 'string' && Array.isArray(o.values))
        .map((o: ProductOption) => ({
          name: o.name,
          values: o.values.map((v) => ({ label: String(v.label), price_delta: Number(v.price_delta) || 0 })),
        }))
    : [];
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  return {
    ...row,
    price: Number(row.price) || 0,
    compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
    back_side_price: Number(row.back_side_price) || 0,
    sold_count: Number(row.sold_count) || 0,
    images: Array.isArray(row.images) ? row.images : [],
    options,
    category: category ?? null,
  } as Product;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await createPublicClient()
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  } catch (e) {
    console.error('[data] getCategories failed:', (e as Error).message);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data } = await createPublicClient()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    return (data as Category) ?? null;
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await createPublicClient().from('store_settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      delivery_fee: Number(data.delivery_fee) || 0,
      free_delivery_threshold: data.free_delivery_threshold == null ? null : Number(data.free_delivery_threshold),
    } as StoreSettings;
  } catch (e) {
    console.error('[data] getSettings failed:', (e as Error).message);
    return DEFAULT_SETTINGS;
  }
}

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export type ProductQuery = {
  categoryId?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  customOnly?: boolean;
};

export async function getProducts(query: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  const { categoryId, q, sort = 'newest', page = 1, pageSize = 12, customOnly } = query;
  try {
    let req = createPublicClient()
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('is_active', true);

    if (categoryId) req = req.eq('category_id', categoryId);
    if (customOnly) req = req.eq('is_customizable', true);
    if (q) {
      // strip characters that have meaning in PostgREST filter syntax
      const clean = q.replace(/[%*,()\\]/g, ' ').trim().slice(0, 60);
      if (clean) req = req.or(`name.ilike.%${clean}%,description.ilike.%${clean}%`);
    }

    if (sort === 'price-asc') req = req.order('price', { ascending: true });
    else if (sort === 'price-desc') req = req.order('price', { ascending: false });
    else if (sort === 'popular') req = req.order('sold_count', { ascending: false }).order('created_at', { ascending: false });
    else req = req.order('created_at', { ascending: false });

    const from = (page - 1) * pageSize;
    const { data, count, error } = await req.range(from, from + pageSize - 1);
    if (error) throw error;
    return { items: (data ?? []).map(normalizeProduct), total: count ?? 0 };
  } catch (e) {
    console.error('[data] getProducts failed:', (e as Error).message);
    return { items: [], total: 0 };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await createPublicClient()
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeProduct(data) : null;
  } catch (e) {
    console.error('[data] getProductBySlug failed:', (e as Error).message);
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  try {
    const { data } = await createPublicClient()
      .from('products')
      .select(PRODUCT_SELECT)
      .in('id', ids)
      .eq('is_active', true);
    const map = new Map((data ?? []).map((r) => [r.id as string, normalizeProduct(r)]));
    return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
  } catch {
    return [];
  }
}

/** Real sales first; if the shop is new, fall back to featured and newest so the section is never empty. */
export async function getBestSellers(limit = 8): Promise<{ items: Product[]; hasSales: boolean }> {
  const sold = await getProducts({ sort: 'popular', pageSize: limit });
  const withSales = sold.items.filter((p) => p.sold_count > 0);
  if (withSales.length >= Math.min(4, limit)) return { items: withSales.slice(0, limit), hasSales: true };
  return { items: sold.items.slice(0, limit), hasSales: withSales.length > 0 };
}

export async function getRecommended(limit = 8, excludeIds: string[] = []): Promise<Product[]> {
  try {
    const { data } = await createPublicClient()
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit + excludeIds.length);
    let items = (data ?? []).map(normalizeProduct).filter((p) => !excludeIds.includes(p.id));
    if (items.length < limit) {
      const more = await getProducts({ sort: 'newest', pageSize: limit + excludeIds.length + items.length });
      const seen = new Set([...excludeIds, ...items.map((p) => p.id)]);
      items = [...items, ...more.items.filter((p) => !seen.has(p.id))];
    }
    return items.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const same = product.category_id
    ? (await getProducts({ categoryId: product.category_id, pageSize: limit + 1 })).items.filter((p) => p.id !== product.id)
    : [];
  if (same.length >= limit) return same.slice(0, limit);
  const more = await getRecommended(limit + 1, [product.id, ...same.map((p) => p.id)]);
  return [...same, ...more].slice(0, limit);
}

export async function getAllSlugsForSitemap() {
  try {
    const client = createPublicClient();
    const [products, categories] = await Promise.all([
      client.from('products').select('slug, updated_at, created_at').eq('is_active', true).limit(5000),
      client.from('categories').select('slug, created_at').eq('is_active', true).limit(500),
    ]);
    return { products: products.data ?? [], categories: categories.data ?? [] };
  } catch {
    return { products: [], categories: [] };
  }
}
