'use client';

import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { createClient } from '@/lib/supabase/client';

export function ProfileForm({ userId, email, fullName, phone }: { userId: string; email: string; fullName: string; phone: string }) {
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await createClient().from('profiles').update({ full_name: name.trim(), phone: tel.trim() || null }).eq('id', userId);
    setSaving(false);
    if (error) toast.error('Could not save your details. Please try again.');
    else toast.success('Details saved');
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Full name" htmlFor="p-name">
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} />
      </Field>
      <Field label="Phone number" htmlFor="p-phone">
        <Input id="p-phone" type="tel" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" maxLength={20} />
      </Field>
      <Field label="Email" htmlFor="p-email">
        <Input id="p-email" value={email} disabled readOnly />
      </Field>
      <Button type="submit" loading={saving}>Save changes</Button>
    </form>
  );
}

export function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Button variant="outline" onClick={() => void signOut()}>
      <LogOut className="size-4" aria-hidden /> Sign out
    </Button>
  );
}
