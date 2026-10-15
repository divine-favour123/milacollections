'use client';

import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddressFields } from '@/components/store/address-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EMPTY_ADDRESS, makeDefaultAddress, removeAddress, saveAddress, streetLine, validateAddress, type AddressInput } from '@/lib/addresses';
import type { Address } from '@/types';

const toInput = (a: Address): AddressInput => ({
  label: a.label,
  full_name: a.full_name,
  phone: a.phone,
  address: a.address,
  landmark: a.landmark ?? '',
  city: a.city,
  state: a.state,
});

export function AddressBook({ userId, addresses, defaults }: { userId: string; addresses: Address[]; defaults: { name: string; phone: string } }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [makeDefault, setMakeDefault] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm({ ...EMPTY_ADDRESS, full_name: defaults.name, phone: defaults.phone });
    setMakeDefault(false);
    setError(null);
    setEditing('new');
  }

  function openEdit(a: Address) {
    setForm(toInput(a));
    setMakeDefault(a.is_default);
    setError(null);
    setEditing(a.id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateAddress(form);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      await saveAddress(userId, form, { id: editing === 'new' ? undefined : (editing as string), makeDefault, isFirst: addresses.length === 0 });
      toast.success('Address saved');
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function run(fn: () => Promise<void>, ok: string) {
    try {
      await fn();
      toast.success(ok);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      {addresses.length === 0 && editing === null ? (
        <div className="border border-dashed border-line-strong px-6 py-12 text-center">
          <MapPin className="mx-auto mb-3 size-7 text-gold-deep" strokeWidth={1.5} aria-hidden />
          <p className="font-display text-xl">No saved addresses yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-slate">Save where you want your orders delivered and checkout takes one tap.</p>
        </div>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) =>
          editing === a.id ? null : (
            <li key={a.id} className="flex flex-col border border-line p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-display text-lg">{a.label}</span>
                {a.is_default ? <Badge tone="gold">Default</Badge> : null}
              </div>
              <p className="font-medium">{a.full_name}</p>
              <p className="text-slate">{streetLine(a)}</p>
              <p className="text-slate">{a.city}, {a.state}</p>
              <p className="text-slate">{a.phone}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-sm">
                <button type="button" onClick={() => openEdit(a)} className="font-semibold text-ink underline-offset-4 hover:underline">Edit</button>
                {!a.is_default ? (
                  <button type="button" onClick={() => run(() => makeDefaultAddress(userId, a.id), 'Default address updated')} className="font-semibold text-ink underline-offset-4 hover:underline">
                    Make default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this address?')) void run(() => removeAddress(userId, a.id), 'Address deleted');
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 font-semibold text-danger underline-offset-4 hover:underline"
                >
                  <Trash2 className="size-4" aria-hidden /> Delete
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing !== null ? (
        <form onSubmit={submit} className="border border-ink p-5 sm:p-7">
          <h3 className="mb-5 font-display text-xl">{editing === 'new' ? 'New address' : 'Edit address'}</h3>
          <AddressFields value={form} onChange={setForm} idPrefix="book" />
          {addresses.length > 0 ? (
            <label className="mt-5 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="size-4 accent-ink" />
              Use as my default address
            </label>
          ) : null}
          {error ? <p role="alert" className="mt-4 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" loading={busy}>Save address</Button>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={openNew}>
          <Plus className="size-4" aria-hidden /> Add an address
        </Button>
      )}
    </div>
  );
}
