'use client';

import { Field, Input, Select } from '@/components/ui/form';
import { ADDRESS_LABELS, type AddressInput } from '@/lib/addresses';
import { NIGERIAN_STATES } from '@/lib/nigeria';
import { cn } from '@/lib/utils';

/** The fields of one delivery address. Controlled by the parent so it works inside the checkout and the address book. */
export function AddressFields({ value, onChange, idPrefix = 'addr' }: { value: AddressInput; onChange: (v: AddressInput) => void; idPrefix?: string }) {
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value });
  const id = (k: string) => `${idPrefix}-${k}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold">Save this address as</span>
        <div className="flex gap-2" role="radiogroup" aria-label="Address label">
          {ADDRESS_LABELS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={value.label === l}
              onClick={() => onChange({ ...value, label: l })}
              className={cn(
                'h-10 rounded-sm border px-5 text-sm transition-colors',
                value.label === l ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <Field label="Full name" htmlFor={id('name')}>
        <Input id={id('name')} required autoComplete="name" value={value.full_name} onChange={set('full_name')} placeholder="Who receives the order" />
      </Field>
      <Field label="Phone number" htmlFor={id('phone')}>
        <Input id={id('phone')} type="tel" inputMode="tel" required autoComplete="tel" value={value.phone} onChange={set('phone')} placeholder="0803 000 0000" />
      </Field>
      <Field label="Street address" htmlFor={id('street')} className="sm:col-span-2">
        <Input id={id('street')} required autoComplete="address-line1" value={value.address} onChange={set('address')} placeholder="House number, street, area" />
      </Field>
      <Field label="Nearest landmark (optional)" htmlFor={id('landmark')} className="sm:col-span-2" hint="A church, school, junction or shop that helps the rider find you.">
        <Input id={id('landmark')} value={value.landmark} onChange={set('landmark')} maxLength={100} placeholder="e.g. Opposite Total filling station" />
      </Field>
      <Field label="City or town" htmlFor={id('city')}>
        <Input id={id('city')} required autoComplete="address-level2" value={value.city} onChange={set('city')} />
      </Field>
      <Field label="State" htmlFor={id('state')}>
        <Select id={id('state')} required autoComplete="address-level1" value={value.state} onChange={set('state')}>
          <option value="" disabled>Choose state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
