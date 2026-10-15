import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui';
import { ProductForm } from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth';
import { normalizeProduct } from '@/lib/data';
import type { Category } from '@/types';

export const metadata: Metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('id, name').order('sort_order').order('name'),
  ]);
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader title="Edit product" />
      <ProductForm product={normalizeProduct(product)} categories={(categories ?? []) as Pick<Category, 'id' | 'name'>[]} />
    </>
  );
}
