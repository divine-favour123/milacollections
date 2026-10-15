import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/store/checkout-form';
import { requireUser } from '@/lib/auth';
import type { Address } from '@/types';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const { supabase, user, profile } = await requireUser('/checkout');
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="mb-10 text-center font-display text-4xl tracking-[0.02em] sm:text-5xl">Checkout</h1>
      <CheckoutForm
        userId={user.id}
        email={user.email ?? ''}
        profile={{ name: profile?.full_name ?? '', phone: profile?.phone ?? '' }}
        addresses={(data ?? []) as Address[]}
      />
    </div>
  );
}
