import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types';

export type AddressInput = {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
};

export const EMPTY_ADDRESS: AddressInput = { label: 'Home', full_name: '', phone: '', address: '', landmark: '', city: '', state: '' };

export const ADDRESS_LABELS = ['Home', 'Work', 'Other'] as const;

/** One line for lists and the order record: street, landmark. */
export const streetLine = (a: Pick<Address, 'address' | 'landmark'>) => (a.landmark ? `${a.address} (near ${a.landmark})` : a.address);

export function validateAddress(v: AddressInput): string | null {
  if (v.full_name.trim().length < 2) return 'Enter the full name of the person receiving the order.';
  if (!/^[0-9+()\-\s]{7,20}$/.test(v.phone.trim())) return 'Enter a phone number we can reach on delivery (digits, spaces, + and - only).';
  if (v.address.trim().length < 5) return 'Enter the house number, street and area.';
  if (v.city.trim().length < 2) return 'Enter the city or town.';
  if (!v.state) return 'Choose the state.';
  return null;
}

const clean = (v: AddressInput) => ({
  label: v.label.trim() || 'Home',
  full_name: v.full_name.trim(),
  phone: v.phone.trim(),
  address: v.address.trim(),
  landmark: v.landmark.trim() || null,
  city: v.city.trim(),
  state: v.state,
});

/** Create or update an address in the signed-in customer's address book (protected by row level security). */
export async function saveAddress(userId: string, v: AddressInput, opts: { id?: string; makeDefault?: boolean; isFirst?: boolean } = {}): Promise<Address> {
  const supabase = createClient();
  const makeDefault = Boolean(opts.makeDefault || opts.isFirst);
  if (makeDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);

  const row = { ...clean(v), ...(makeDefault ? { is_default: true } : {}) };
  const q = opts.id
    ? supabase.from('addresses').update(row).eq('id', opts.id).eq('user_id', userId)
    : supabase.from('addresses').insert({ ...row, user_id: userId });
  const { data, error } = await q.select('*').single();
  if (error || !data) throw new Error('We could not save this address. Please try again.');
  return data as Address;
}

export async function removeAddress(userId: string, id: string) {
  const { error } = await createClient().from('addresses').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error('We could not delete this address. Please try again.');
}

export async function makeDefaultAddress(userId: string, id: string) {
  const supabase = createClient();
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId);
  if (error) throw new Error('We could not update your default address.');
}
