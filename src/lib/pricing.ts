import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { MAX_QTY } from '@/lib/constants';
import { normalizeProduct } from '@/lib/data';
import type { Product, StoreSettings } from '@/types';

/** Path pattern for customer photo uploads: <user-uuid>/<file> */
export const PHOTO_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z0-9._-]{1,120}$/i;


export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(MAX_QTY),
  options: z.record(z.string(), z.string()).default({}),
  custom: z
    .object({
      sides: z.enum(['front', 'front_and_back']),
      frontPath: z.string().regex(PHOTO_PATH),
      backPath: z.string().regex(PHOTO_PATH).nullable().optional(),
      note: z.string().max(500).optional().default(''),
    })
    .nullable()
    .optional(),
});

export const cartSchema = z.object({ items: z.array(cartItemSchema).min(1).max(30) });
export type CartInput = z.infer<typeof cartItemSchema>;

export type PricedLine = {
  index: number;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options: { name: string; value: string }[];
  custom: { sides: 'front' | 'front_and_back'; frontPath: string; backPath: string | null; note: string } | null;
  issue: string | null;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  hasIssues: boolean;
};

const toKobo = (n: number) => Math.round(n * 100);

/**
 * Single source of truth for what a cart costs. Runs on the server and never trusts
 * prices sent by the browser.
 */
export async function priceCart(
  client: SupabaseClient,
  items: CartInput[],
  settings: Pick<StoreSettings, 'delivery_fee' | 'free_delivery_threshold'>,
  opts: { userId?: string } = {},
): Promise<PricedCart> {
  const ids = [...new Set(items.map((i) => i.productId))];
  const { data, error } = await client
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('is_active', true);
  if (error) throw new Error(error.message);

  const products = new Map<string, Product>((data ?? []).map((r) => [r.id as string, normalizeProduct(r)]));

  let subtotalKobo = 0;
  const lines: PricedLine[] = items.map((item, index) => {
    const product = products.get(item.productId);
    if (!product) {
      return {
        index,
        productId: item.productId,
        slug: '',
        name: 'Unavailable item',
        image: null,
        quantity: item.quantity,
        unitPrice: 0,
        lineTotal: 0,
        options: [],
        custom: null,
        issue: 'This item is no longer available.',
      };
    }

    let issue: string | null = null;
    let unitKobo = toKobo(product.price);
    const chosen: { name: string; value: string }[] = [];

    if (!product.in_stock) issue = 'This item is currently out of stock.';

    for (const group of product.options) {
      const pick = item.options[group.name];
      const value = group.values.find((v) => v.label === pick);
      if (!value) {
        issue ??= `Choose a ${group.name.toLowerCase()} for this item.`;
        continue;
      }
      unitKobo += toKobo(value.price_delta);
      chosen.push({ name: group.name, value: value.label });
    }

    let custom: PricedLine['custom'] = null;
    if (product.is_customizable) {
      const c = item.custom;
      if (!c || !c.frontPath) {
        issue ??= 'Upload the photo for this custom piece.';
      } else if (c.sides === 'front_and_back' && !c.backPath) {
        issue ??= 'Upload the photo for the back of this piece.';
      } else {
        const paths = [c.frontPath, c.sides === 'front_and_back' ? c.backPath : null].filter(Boolean) as string[];
        if (opts.userId && paths.some((p) => !p.startsWith(`${opts.userId}/`))) {
          issue ??= 'A photo on this item was not uploaded from your account. Please upload it again.';
        }
        if (c.sides === 'front_and_back') unitKobo += toKobo(product.back_side_price);
        custom = {
          sides: c.sides,
          frontPath: c.frontPath,
          backPath: c.sides === 'front_and_back' ? (c.backPath ?? null) : null,
          note: (c.note ?? '').trim(),
        };
      }
    }

    const lineKobo = unitKobo * item.quantity;
    if (!issue) subtotalKobo += lineKobo;

    return {
      index,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? null,
      quantity: item.quantity,
      unitPrice: unitKobo / 100,
      lineTotal: lineKobo / 100,
      options: chosen,
      custom,
      issue,
    };
  });

  const hasIssues = lines.some((l) => l.issue);
  const subtotal = subtotalKobo / 100;
  const threshold = settings.free_delivery_threshold;
  const deliveryFee = threshold != null && threshold > 0 && subtotal >= threshold ? 0 : Number(settings.delivery_fee) || 0;

  return { lines, subtotal, deliveryFee, total: Math.round((subtotal + deliveryFee) * 100) / 100, hasIssues };
}

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number we can reach you on')
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, 'Phone number can only contain digits, spaces, + and -'),
  address: z.string().trim().min(5, 'Enter your delivery address').max(300),
  city: z.string().trim().min(2, 'Enter your city or town').max(80),
  state: z.string().trim().min(2, 'Choose your state').max(60),
  note: z.string().trim().max(300).optional().default(''),
});

export const checkoutSchema = z.object({
  items: cartSchema.shape.items,
  shipping: shippingSchema,
});

/** Fresh (uncached) delivery settings for price calculations. */
export async function fetchDeliverySettings(client: SupabaseClient): Promise<Pick<StoreSettings, 'delivery_fee' | 'free_delivery_threshold'>> {
  const { data } = await client.from('store_settings').select('delivery_fee, free_delivery_threshold').eq('id', 1).maybeSingle();
  return {
    delivery_fee: Number(data?.delivery_fee) || 0,
    free_delivery_threshold: data?.free_delivery_threshold == null ? null : Number(data.free_delivery_threshold),
  };
}

/** Reads the delivery rules with a client that never caches. */
export async function loadDeliverySettings(client: SupabaseClient): Promise<Pick<StoreSettings, 'delivery_fee' | 'free_delivery_threshold'>> {
  const { data } = await client.from('store_settings').select('delivery_fee, free_delivery_threshold').eq('id', 1).maybeSingle();
  return {
    delivery_fee: Number(data?.delivery_fee) || 0,
    free_delivery_threshold: data?.free_delivery_threshold == null ? null : Number(data.free_delivery_threshold),
  };
}
