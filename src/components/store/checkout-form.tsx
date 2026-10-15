'use client';

import { Check, Lock, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AddressFields } from '@/components/store/address-fields';
import { CartLines } from '@/components/store/cart-lines';
import { useCart } from '@/components/store/cart-provider';
import { OrderSummary } from '@/components/store/order-summary';
import { useCartPricing } from '@/components/store/use-cart-pricing';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Textarea } from '@/components/ui/form';
import { Input } from '@/components/ui/form';
import { EMPTY_ADDRESS, saveAddress, streetLine, validateAddress, type AddressInput } from '@/lib/addresses';
import { cn } from '@/lib/utils';
import type { Address } from '@/types';

export function CheckoutForm({
  userId,
  email,
  profile,
  addresses: initial,
}: {
  userId: string;
  email: string;
  profile: { name: string; phone: string };
  addresses: Address[];
}) {
  const { lines, hydrated, subtotal } = useCart();
  const { data, loading, byLineId } = useCartPricing();

  const [addresses, setAddresses] = useState(initial);
  const [selected, setSelected] = useState<string>(initial[0]?.id ?? 'new');
  const [fresh, setFresh] = useState<AddressInput>({ ...EMPTY_ADDRESS, full_name: profile.name, phone: profile.phone });
  const [saveForLater, setSaveForLater] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return <div className="skeleton h-96" />;

  if (!lines.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something you love, then come back to check out."
        action={<ButtonLink href="/shop">Start shopping</ButtonLink>}
      />
    );
  }

  const blocked = Boolean(data?.hasIssues);
  const chosen = addresses.find((a) => a.id === selected);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || blocked) return;
    setError(null);

    let ship: AddressInput;
    if (selected === 'new' || !chosen) {
      const problem = validateAddress(fresh);
      if (problem) return setError(problem);
      ship = fresh;
    } else {
      ship = { label: chosen.label, full_name: chosen.full_name, phone: chosen.phone, address: chosen.address, landmark: chosen.landmark ?? '', city: chosen.city, state: chosen.state };
    }

    setSubmitting(true);
    try {
      if (selected === 'new' && saveForLater) {
        // best effort: a failure here must never stop the order
        try {
          const saved = await saveAddress(userId, fresh, { isFirst: addresses.length === 0 });
          setAddresses((a) => [saved, ...a]);
        } catch {}
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, options: l.options, custom: l.custom })),
          shipping: {
            fullName: ship.full_name,
            phone: ship.phone,
            address: streetLine({ address: ship.address, landmark: ship.landmark || null }),
            city: ship.city,
            state: ship.state,
            note,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = '/login?next=/checkout';
        return;
      }
      if (!res.ok || !json.authorizationUrl) throw new Error(json.error || 'We could not start your payment. Please try again.');
      window.location.href = json.authorizationUrl;
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  const card = 'relative flex w-full cursor-pointer gap-4 border p-4 text-left transition-colors sm:p-5';

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14" noValidate>
      <div className="space-y-10">
        <section aria-labelledby="delivery-h">
          <h2 id="delivery-h" className="mb-5 font-display text-2xl">Where should we deliver?</h2>

          <div role="radiogroup" aria-labelledby="delivery-h" className="space-y-3">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected === a.id}
                onClick={() => setSelected(a.id)}
                className={cn(card, selected === a.id ? 'border-ink bg-frost' : 'border-line hover:border-line-strong')}
              >
                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', selected === a.id ? 'border-ink bg-ink text-white' : 'border-line-strong')}>
                  {selected === a.id ? <Check className="size-3" strokeWidth={3} aria-hidden /> : null}
                </span>
                <span className="min-w-0 text-[0.9375rem]">
                  <span className="mb-0.5 flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    {a.is_default ? <span className="text-xs text-gold-deep">Default</span> : null}
                  </span>
                  <span className="block">{a.full_name} · {a.phone}</span>
                  <span className="block text-slate">{streetLine(a)}, {a.city}, {a.state}</span>
                </span>
              </button>
            ))}

            <button
              type="button"
              role="radio"
              aria-checked={selected === 'new'}
              onClick={() => setSelected('new')}
              className={cn(card, 'items-center', selected === 'new' ? 'border-ink bg-frost' : 'border-dashed border-line-strong hover:border-ink')}
            >
              <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', selected === 'new' ? 'border-ink bg-ink text-white' : 'border-line-strong')}>
                {selected === 'new' ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <Plus className="size-3" aria-hidden />}
              </span>
              <span className="font-semibold">{addresses.length ? 'Deliver to a different address' : 'Add your delivery address'}</span>
            </button>
          </div>

          {selected === 'new' ? (
            <div className="mt-5 border border-line p-5 sm:p-7">
              <AddressFields value={fresh} onChange={setFresh} idPrefix="co" />
              <label className="mt-5 flex items-center gap-3 text-sm">
                <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="size-4 accent-ink" />
                Save this address for next time
              </label>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" hint="Your receipt goes here.">
              <Input id="email" value={email} readOnly disabled />
            </Field>
            <Field label="Note for delivery (optional)" htmlFor="note" className="sm:col-span-2">
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="min-h-20" placeholder="Gate code, best time to call…" />
            </Field>
          </div>
        </section>

        <section aria-labelledby="items-h">
          <h2 id="items-h" className="font-display text-2xl">Your items</h2>
          <CartLines lines={lines} pricing={byLineId} />
        </section>
      </div>

      <aside aria-label="Order summary" className="bg-frost p-6 sm:p-7 lg:sticky lg:top-32">
        <h2 className="mb-5 font-display text-2xl">Order summary</h2>
        <OrderSummary
          subtotal={data ? data.subtotal : subtotal}
          deliveryFee={data ? data.deliveryFee : null}
          total={data ? data.total : subtotal}
          loading={loading}
          freeDeliveryThreshold={data?.freeDeliveryThreshold}
        />
        {chosen || selected === 'new' ? (
          <p className="mt-5 flex items-start gap-2 text-sm text-slate">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
            <span>
              {chosen ? `${chosen.city}, ${chosen.state}` : fresh.city && fresh.state ? `${fresh.city}, ${fresh.state}` : 'Delivery across Nigeria'}
            </span>
          </p>
        ) : null}
        {blocked ? (
          <p role="alert" className="mt-4 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            Some items need attention. Remove or update them in your cart, then try again.
          </p>
        ) : null}
        {error ? <p role="alert" className="mt-4 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
        <Button type="submit" size="lg" className="mt-6 w-full" loading={submitting} disabled={blocked || loading}>
          <Lock className="size-4" aria-hidden />
          {submitting ? 'Opening Paystack…' : 'Pay now'}
        </Button>
        <p className="mt-3 text-center text-[0.8125rem] text-slate">You pay on Paystack&rsquo;s secure page. We never see your card details.</p>
        <p className="mt-4 text-center text-sm">
          <Link href="/shop" className="font-semibold text-gold-deep underline-offset-4 hover:underline">Continue shopping</Link>
        </p>
      </aside>
    </form>
  );
}
