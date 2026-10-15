import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Milla admin' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { supabase, profile, user } = await requireAdmin();
  const [orders, messages] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'received').eq('payment_status', 'paid'),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
  ]);

  return (
    <AdminShell name={profile.full_name || user.email || 'Admin'} counts={{ newOrders: orders.count ?? 0, unreadMessages: messages.count ?? 0 }}>
      {children}
    </AdminShell>
  );
}
