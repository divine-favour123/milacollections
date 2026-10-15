import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/ui';
import { ProductForm } from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth';
import type { Category } from '@/types';

export const metadata: Metadata = { title: 'Add product' };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('categories').select('id, name').order('sort_order').order('name');
  return (
    <>
      <AdminPageHeader title="Add product" />
      <ProductForm categories={(data ?? []) as Pick<Category, 'id' | 'name'>[]} />
    </>
  );
}
