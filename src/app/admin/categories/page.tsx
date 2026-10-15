import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/ui';
import { CategoryManager, type CategoryRow } from '@/components/admin/category-manager';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Categories' };

export default async function AdminCategories() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('categories').select('*, products(count)').order('sort_order').order('name');
  const rows: CategoryRow[] = (data ?? []).map((c) => ({
    ...c,
    product_count: Array.isArray(c.products) ? Number(c.products[0]?.count ?? 0) : 0,
  }));
  return (
    <>
      <AdminPageHeader title="Categories" description="Group your jewelry so customers can find it quickly." />
      <CategoryManager categories={rows} />
    </>
  );
}
