'use client';

import { Trash2, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomPhotoThumb } from '@/components/store/custom-photo-thumb';
import { QuantityStepper } from '@/components/store/quantity-stepper';
import { useCart, type CartLine } from '@/components/store/cart-provider';
import type { PricedLine } from '@/lib/pricing';
import { formatNaira } from '@/lib/utils';

export function CartLines({
  lines,
  pricing,
  onNavigate,
  compact = false,
}: {
  lines: CartLine[];
  pricing?: Map<string, PricedLine>;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const { setQuantity, remove } = useCart();

  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => {
        const priced = pricing?.get(line.id);
        const unit = priced && !priced.issue ? priced.unitPrice : line.unitPrice;
        const optionText = Object.entries(line.options)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ');
        return (
          <li key={line.id} className="flex gap-4 py-5">
            <Link
              href={`/product/${line.slug}`}
              onClick={onNavigate}
              className="relative block size-20 shrink-0 overflow-hidden bg-frost sm:size-24"
            >
              {line.image ? (
                <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
              ) : null}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={onNavigate}
                    className="line-clamp-2 leading-snug font-semibold hover:underline"
                  >
                    {line.name}
                  </Link>
                  {optionText ? <p className="mt-0.5 text-sm text-slate">{optionText}</p> : null}
                </div>
                <p className="shrink-0 font-semibold tabular-nums">{formatNaira(unit * line.quantity)}</p>
              </div>

              {line.custom ? (
                <div className="mt-2 flex items-center gap-2">
                  <CustomPhotoThumb path={line.custom.frontPath} label="Front photo" className="size-11" />
                  {line.custom.sides === 'front_and_back' && line.custom.backPath ? (
                    <CustomPhotoThumb path={line.custom.backPath} label="Back photo" className="size-11" />
                  ) : null}
                  <span className="text-sm text-slate">
                    {line.custom.sides === 'front_and_back' ? 'Photos on front and back' : 'Photo on front'}
                  </span>
                </div>
              ) : null}

              {priced?.issue ? (
                <p role="alert" className="mt-2 flex items-start gap-1.5 bg-danger-soft px-2.5 py-1.5 text-sm font-medium text-danger">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {priced.issue}
                </p>
              ) : null}

              <div className="mt-auto flex items-center justify-between pt-3">
                <QuantityStepper size="sm" value={line.quantity} onChange={(q) => setQuantity(line.id, q)} label={`Quantity for ${line.name}`} />
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-slate transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {compact ? <span className="sr-only">Remove {line.name}</span> : <span>Remove</span>}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
