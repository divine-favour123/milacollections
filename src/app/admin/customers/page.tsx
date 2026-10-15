import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui';
import { EmptyState } from '@/components/ui/empty-state';
import { requireAdmin } from '@/lib/auth';
import { toWhatsappDigits } from '@/lib/lagos';
import { formatDate, formatNaira, initials } from '@/lib/utils';
import type { Profile } from '@/types';

export const metadata: Metadata = { title: 'Customers' };

export default async function AdminCustomers() {
  const { supabase } = await requireAdmin();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }).limit(300),
    supabase.from('orders').select('user_id, total').eq('payment_status', 'paid').limit(5000),
  ]);

  const stats = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const s = stats.get(o.user_id) ?? { count: 0, spent: 0 };
    s.count += 1;
    s.spent += Number(o.total);
    stats.set(o.user_id, s);
  }
  const list = (profiles ?? []) as Profile[];

  return (
    <>
      <AdminPageHeader title="Customers" description={`${list.length} ${list.length === 1 ? 'person has' : 'people have'} created an account.`} />
      {list.length ? (
        <ul className="space-y-3">
          {list.map((c) => {
            const s = stats.get(c.id);
            return (
              <li key={c.id} className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-bold text-gold-deep">{initials(c.full_name || c.email)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.full_name || 'No name yet'}</p>
                    <p className="truncate text-sm text-slate">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatNaira(s?.spent ?? 0)}</p>
                    <p className="text-xs text-slate">{s?.count ?? 0} {s?.count === 1 ? 'order' : 'orders'}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
                  <span className="mr-auto text-slate">Joined {formatDate(c.created_at)}</span>
                  {c.phone ? (
                    <>
                      <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-frost px-3.5 font-semibold"><Phone className="size-4" aria-hidden /> Call</a>
                      <a href={`https://wa.me/${toWhatsappDigits(c.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-frost px-3.5 font-semibold"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>
                    </>
                  ) : null}
                  {c.email ? <a href={`mailto:${c.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-frost px-3.5 font-semibold"><Mail className="size-4" aria-hidden /> Email</a> : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No customers yet" description="People who sign up on your store will appear here." />
      )}
    </>
  );
}
