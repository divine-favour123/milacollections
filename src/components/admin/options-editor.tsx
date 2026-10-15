'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

export type OptionDraft = { name: string; values: { label: string; delta: string }[] };

export function OptionsEditor({ value, onChange }: { value: OptionDraft[]; onChange: (v: OptionDraft[]) => void }) {
  const update = (i: number, patch: Partial<OptionDraft>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const setValue = (oi: number, vi: number, patch: Partial<OptionDraft['values'][number]>) =>
    update(oi, { values: value[oi].values.map((v, idx) => (idx === vi ? { ...v, ...patch } : v)) });

  return (
    <div className="space-y-4">
      {value.map((opt, oi) => (
        <div key={oi} className="rounded-2xl border border-line bg-frost/50 p-4">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor={`opt-${oi}`} className="mb-1.5 block text-sm font-semibold">Option name</label>
              <Input id={`opt-${oi}`} value={opt.name} onChange={(e) => update(oi, { name: e.target.value })} placeholder="e.g. Length, Size, Finish" maxLength={40} />
            </div>
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== oi))} aria-label={`Remove option ${opt.name || oi + 1}`} className="grid size-12 shrink-0 place-items-center rounded-xl text-danger hover:bg-danger-soft">
              <Trash2 className="size-5" aria-hidden />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <p className="text-sm font-semibold">Choices <span className="font-normal text-slate">(extra price is optional)</span></p>
            {opt.values.map((v, vi) => (
              <div key={vi} className="flex items-center gap-2">
                <Input aria-label="Choice label" value={v.label} onChange={(e) => setValue(oi, vi, { label: e.target.value })} placeholder="e.g. 20 inch" maxLength={40} className="min-w-0 flex-1" />
                <Input
                  aria-label="Extra price in naira"
                  value={v.delta}
                  onChange={(e) => setValue(oi, vi, { delta: e.target.value.replace(/[^0-9-]/g, '') })}
                  inputMode="numeric"
                  placeholder="+ ₦0"
                  className="w-28 shrink-0"
                />
                <button
                  type="button"
                  disabled={opt.values.length === 1}
                  onClick={() => update(oi, { values: opt.values.filter((_, i) => i !== vi) })}
                  aria-label="Remove choice"
                  className="grid size-10 shrink-0 place-items-center rounded-full text-slate hover:bg-danger-soft hover:text-danger disabled:opacity-30"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
            <Button type="button" variant="soft" size="sm" onClick={() => update(oi, { values: [...opt.values, { label: '', delta: '' }] })}>
              <Plus className="size-4" aria-hidden /> Add choice
            </Button>
          </div>
        </div>
      ))}
      {value.length < 5 ? (
        <Button type="button" variant="outline" onClick={() => onChange([...value, { name: '', values: [{ label: '', delta: '' }] }])}>
          <Plus className="size-4" aria-hidden /> Add an option
        </Button>
      ) : null}
    </div>
  );
}
