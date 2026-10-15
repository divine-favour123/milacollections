import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/ui';
import { SettingsForm } from '@/components/admin/settings-form';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_SETTINGS } from '@/lib/data';
import type { StoreSettings } from '@/types';

export const metadata: Metadata = { title: 'Settings' };

export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
  const settings: StoreSettings = {
    ...DEFAULT_SETTINGS,
    ...(data ?? {}),
    delivery_fee: Number(data?.delivery_fee) || 0,
    free_delivery_threshold: data?.free_delivery_threshold == null ? null : Number(data.free_delivery_threshold),
  };
  return (
    <>
      <AdminPageHeader title="Store settings" description="Delivery, contact details and the message at the top of your store." />
      <SettingsForm settings={settings} />
    </>
  );
}
