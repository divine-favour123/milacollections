'use client';

import { Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/auth-provider';
import { lineId, useCart } from '@/components/store/cart-provider';
import { PhotoUploadField, type UploadedPhoto } from '@/components/store/photo-upload-field';
import { QuantityStepper } from '@/components/store/quantity-stepper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { cn, formatNaira } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductPurchase({ product }: { product: Product }) {
  const { add, open } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]?.label ?? ''])),
  );
  const [qty, setQty] = useState(1);
  const [sides, setSides] = useState<'front' | 'front_and_back'>('front');
  const [front, setFront] = useState<UploadedPhoto | null>(null);
  const [back, setBack] = useState<UploadedPhoto | null>(null);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ front?: string; back?: string; general?: string }>({});
  const [justAdded, setJustAdded] = useState(false);

  const custom = product.is_customizable;
  const nextPath = `/product/${product.slug}`;

  const unitPrice = useMemo(() => {
    let p = product.price;
    for (const group of product.options) {
      p += group.values.find((v) => v.label === selected[group.name])?.price_delta ?? 0;
    }
    if (custom && sides === 'front_and_back') p += product.back_side_price;
    return p;
  }, [product, selected, sides, custom]);

  function handleAdd() {
    const next: typeof errors = {};
    if (custom) {
      if (!user) next.general = 'Sign in first so we can save your photos with your order.';
      else {
        if (!front) next.front = 'Add the photo for the front of the pendant.';
        if (sides === 'front_and_back' && !back) next.back = 'Add the photo for the back of the pendant.';
      }
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    add({
      id: lineId(product.id, selected, custom ? { sides, frontPath: front?.path ?? '', backPath: null, note } : null, front?.path ?? ''),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? null,
      unitPrice,
      quantity: qty,
      options: selected,
      custom: custom
        ? { sides, frontPath: front!.path, backPath: sides === 'front_and_back' ? back!.path : null, note: note.trim() }
        : null,
    });

    toast.success('Added to your cart');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    if (custom) {
      setFront(null);
      setBack(null);
      setNote('');
    }
    setQty(1);
    open();
  }

  return (
    <div className="space-y-7">
      {product.options.map((group) => (
        <fieldset key={group.name}>
          <legend className="mb-2.5 text-sm font-semibold">
            {group.name}: <span className="font-normal text-slate">{selected[group.name]}</span>
          </legend>
          <div role="radiogroup" aria-label={group.name} className="flex flex-wrap gap-2">
            {group.values.map((v) => {
              const active = selected[group.name] === v.label;
              return (
                <button
                  key={v.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected((s) => ({ ...s, [group.name]: v.label }))}
                  className={cn(
                    'min-h-11 rounded-sm border px-5 text-[0.9375rem] font-semibold transition-colors',
                    active ? 'border-ink bg-ink text-white' : 'border-line-strong bg-paper hover:border-ink',
                  )}
                >
                  {v.label}
                  {v.price_delta ? <span className={cn('ml-1.5 font-normal', active ? 'text-white/75' : 'text-slate')}>{v.price_delta > 0 ? '+' : ''}{formatNaira(v.price_delta)}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {custom ? (
        <section aria-label="Customize with your photos" className="space-y-5 rounded-3xl bg-gold-soft/70 p-5">
          <div>
            <h2 className="font-display text-xl font-medium">Add your photos</h2>
            <p className="mt-1 text-sm text-slate">
              {product.custom_instructions || 'Use a clear, well-lit photo. The face or subject should be in the middle of the picture.'}
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Where should the photo go?</legend>
            <div role="radiogroup" aria-label="Photo placement" className="grid gap-2.5 sm:grid-cols-2">
              {([
                { value: 'front', title: 'Front only', sub: 'Included in the price' },
                {
                  value: 'front_and_back',
                  title: 'Front and back',
                  sub: product.back_side_price > 0 ? `+${formatNaira(product.back_side_price)} per piece` : 'No extra charge',
                },
              ] as const).map((o) => {
                const active = sides === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSides(o.value)}
                    className={cn(
                      'rounded-2xl border bg-paper px-4 py-3 text-left transition-colors',
                      active ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink',
                    )}
                  >
                    <span className="flex items-center justify-between font-semibold">
                      {o.title}
                      {active ? <Check className="size-4" aria-hidden /> : null}
                    </span>
                    <span className="text-sm text-slate">{o.sub}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {!authLoading && !user ? (
            <div className="rounded-2xl bg-paper p-4 text-sm">
              <p className="font-semibold">Sign in to upload your photos</p>
              <p className="mt-0.5 text-slate">Your photos are stored privately and only used to make your order.</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="inline-flex h-10 items-center rounded-sm bg-ink px-5 font-semibold text-white">
                  Sign in
                </Link>
                <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="inline-flex h-10 items-center rounded-sm border border-line-strong px-5 font-semibold">
                  Create account
                </Link>
              </div>
            </div>
          ) : null}

          {user ? (
            <div className="space-y-4">
              <PhotoUploadField
                label={sides === 'front_and_back' ? 'Front photo' : 'Your photo'}
                userId={user.id}
                value={front}
                onChange={(p) => {
                  setFront(p);
                  setErrors((e) => ({ ...e, front: undefined }));
                }}
                error={errors.front}
              />
              {sides === 'front_and_back' ? (
                <PhotoUploadField
                  label="Back photo"
                  userId={user.id}
                  value={back}
                  onChange={(p) => {
                    setBack(p);
                    setErrors((e) => ({ ...e, back: undefined }));
                  }}
                  error={errors.back}
                />
              ) : null}
              <div>
                <label htmlFor="custom-note" className="mb-1.5 block text-sm font-semibold">
                  Anything we should know? <span className="font-normal text-slate">(optional)</span>
                </label>
                <Textarea
                  id="custom-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  className="min-h-20"
                  placeholder="For example: a name to engrave, or which part of the photo to focus on."
                />
              </div>
              <p className="text-[0.8125rem] text-slate">
                Want a different photo on each pendant? Add them to your cart one at a time.
              </p>
            </div>
          ) : null}
          {errors.general ? <p role="alert" className="text-sm font-medium text-danger">{errors.general}</p> : null}
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-bar backdrop-blur lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
        <QuantityStepper value={qty} onChange={setQty} />
        <Button
          size="lg"
          variant="primary"
          className="min-w-0 flex-1"
          disabled={!product.in_stock}
          onClick={handleAdd}
        >
          {!product.in_stock ? (
            'Sold out'
          ) : justAdded ? (
            <>
              <Check className="size-5" aria-hidden /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="size-5" aria-hidden />
              <span className="truncate">Add to cart · {formatNaira(unitPrice * qty)}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
