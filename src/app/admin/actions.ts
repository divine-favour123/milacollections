'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { getAdminContext } from '@/lib/auth';
import { categorySchema, productSchema, settingsSchema, type CategoryInput, type ProductInput, type SettingsInput } from '@/lib/admin-schemas';
import { ADMIN_STATUS_OPTIONS } from '@/lib/order-status';
import { site } from '@/lib/site';
import { slugify, storagePathFromUrl } from '@/lib/utils';
import type { ActionResult, OrderStatus } from '@/types';

const NOT_ALLOWED = { ok: false as const, error: 'You do not have permission to do that. Please sign in again.' };

function refreshStorefront() {
  updateTag('catalog');
  revalidatePath('/', 'layout');
}

async function uniqueSlug(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminContext>>>['supabase'],
  table: 'products' | 'categories',
  base: string,
  ignoreId?: string,
) {
  const root = slugify(base) || (table === 'products' ? 'product' : 'category');
  const { data } = await supabase.from(table).select('id, slug').like('slug', `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== ignoreId).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 200; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
  return `${root}-${Date.now().toString(36)}`;
}

async function removeImages(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminContext>>>['supabase'],
  urls: string[],
) {
  const paths = urls.map((u) => storagePathFromUrl(u, site.buckets.products)).filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from(site.buckets.products).remove(paths);
}

/* ───────────── products ───────────── */

export async function saveProduct(input: ProductInput, id?: string): Promise<ActionResult<{ id: string }>> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const p = parsed.data;

  const names = p.options.map((o) => o.name.toLowerCase());
  if (new Set(names).size !== names.length) return { ok: false, error: 'Two options have the same name.' };
  if (p.compare_at_price != null && p.compare_at_price <= p.price) {
    return { ok: false, error: 'The "was" price must be higher than the selling price, or leave it empty.' };
  }

  const row = {
    name: p.name,
    description: p.description || null,
    price: p.price,
    compare_at_price: p.compare_at_price,
    category_id: p.category_id,
    images: p.images,
    is_active: p.is_active,
    is_featured: p.is_featured,
    in_stock: p.in_stock,
    is_customizable: p.is_customizable,
    back_side_price: p.is_customizable ? p.back_side_price : 0,
    custom_instructions: p.is_customizable ? p.custom_instructions || null : null,
    options: p.options,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data: before } = await ctx.supabase.from('products').select('images').eq('id', id).maybeSingle();
    const { error } = await ctx.supabase.from('products').update(row).eq('id', id);
    if (error) return { ok: false, error: 'Could not save the product. ' + error.message };
    const removed = ((before?.images as string[]) ?? []).filter((u) => !p.images.includes(u));
    if (removed.length) await removeImages(ctx.supabase, removed);
    refreshStorefront();
    return { ok: true, data: { id } };
  }

  const slug = await uniqueSlug(ctx.supabase, 'products', p.name);
  const { data, error } = await ctx.supabase.from('products').insert({ ...row, slug }).select('id').single();
  if (error || !data) return { ok: false, error: 'Could not save the product. ' + (error?.message ?? '') };
  refreshStorefront();
  return { ok: true, data: { id: data.id } };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const { data: before } = await ctx.supabase.from('products').select('images').eq('id', id).maybeSingle();
  const { error } = await ctx.supabase.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: 'Could not delete the product. ' + error.message };
  await removeImages(ctx.supabase, (before?.images as string[]) ?? []);
  refreshStorefront();
  return { ok: true };
}

export async function setProductFlag(id: string, field: 'is_active' | 'is_featured' | 'in_stock', value: boolean): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  if (!['is_active', 'is_featured', 'in_stock'].includes(field)) return { ok: false, error: 'Unknown setting.' };
  const { error } = await ctx.supabase.from('products').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshStorefront();
  return { ok: true };
}

/* ───────────── categories ───────────── */

export async function saveCategory(input: CategoryInput, id?: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const c = parsed.data;
  const row = { name: c.name, description: c.description || null, image_url: c.image_url, sort_order: c.sort_order, is_active: c.is_active };

  if (id) {
    const { data: before } = await ctx.supabase.from('categories').select('image_url').eq('id', id).maybeSingle();
    const { error } = await ctx.supabase.from('categories').update(row).eq('id', id);
    if (error) return { ok: false, error: error.message };
    if (before?.image_url && before.image_url !== c.image_url) await removeImages(ctx.supabase, [before.image_url as string]);
  } else {
    const slug = await uniqueSlug(ctx.supabase, 'categories', c.name);
    const { error } = await ctx.supabase.from('categories').insert({ ...row, slug });
    if (error) return { ok: false, error: error.message };
  }
  refreshStorefront();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const { data: before } = await ctx.supabase.from('categories').select('image_url').eq('id', id).maybeSingle();
  const { error } = await ctx.supabase.from('categories').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  if (before?.image_url) await removeImages(ctx.supabase, [before.image_url as string]);
  refreshStorefront();
  return { ok: true };
}

export async function setCategoryActive(id: string, value: boolean): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const { error } = await ctx.supabase.from('categories').update({ is_active: value }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshStorefront();
  return { ok: true };
}

/* ───────────── orders ───────────── */

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  if (!ADMIN_STATUS_OPTIONS.includes(status)) return { ok: false, error: 'Unknown status.' };
  const { data: order } = await ctx.supabase.from('orders').select('payment_status').eq('id', orderId).maybeSingle();
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.payment_status !== 'paid' && status !== 'cancelled') {
    return { ok: false, error: 'This order has not been paid yet, so it cannot move forward.' };
  }
  const { error } = await ctx.supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

/* ───────────── messages ───────────── */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const { error } = await ctx.supabase.from('messages').update({ is_read: read }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const { error } = await ctx.supabase.from('messages').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

/* ───────────── settings ───────────── */

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ALLOWED;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const { error } = await ctx.supabase.from('store_settings').upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  refreshStorefront();
  return { ok: true };
}
