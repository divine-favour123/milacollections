import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/ui';
import { MessageList } from '@/components/admin/message-list';
import { EmptyState } from '@/components/ui/empty-state';
import { requireAdmin } from '@/lib/auth';
import type { ContactMessage } from '@/types';

export const metadata: Metadata = { title: 'Messages' };

export default async function AdminMessages() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100);
  const messages = (data ?? []) as ContactMessage[];
  return (
    <>
      <AdminPageHeader title="Messages" description="Messages from the contact form on your store." />
      {messages.length ? <MessageList messages={messages} /> : <EmptyState title="No messages yet" description="When someone uses the contact form, their message will show up here." />}
    </>
  );
}
