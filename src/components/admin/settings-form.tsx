'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveSettings } from '@/app/admin/actions';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Card, CardTitle } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import type { StoreSettings } from '@/types';

const numOrNull = (v: string) => {
  const n = Number(v.trim());
  return v.trim() === '' || Number.isNaN(n) ? null : n;
};

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    whatsapp: settings.whatsapp ?? '',
    phone: settings.phone ?? '',
    email: settings.email ?? '',
    address: settings.address ?? '',
    instagram: settings.instagram ?? '',
    tiktok: settings.tiktok ?? '',
    delivery_fee: settings.delivery_fee ? String(settings.delivery_fee) : '',
    free_delivery_threshold: settings.free_delivery_threshold ? String(settings.free_delivery_threshold) : '',
  });
  const [hero, setHero] = useState<string[]>(settings.hero_image_url ? [settings.hero_image_url] : []);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const setNum = (k: 'delivery_fee' | 'free_delivery_threshold') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value.replace(/[^0-9.]/g, '') }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveSettings({
        announcement: '',
        whatsapp: f.whatsapp,
        phone: f.phone,
        email: f.email,
        address: f.address,
        instagram: f.instagram,
        tiktok: f.tiktok,
        delivery_fee: numOrNull(f.delivery_fee) ?? 0,
        free_delivery_threshold: numOrNull(f.free_delivery_threshold),
        hero_image_url: hero[0] ?? null,
      });
      if (!res.ok) return setError(res.error);
      toast.success('Settings saved');
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 font-medium text-danger">{error}</p> : null}

      <Card>
        <CardTitle hint="How customers pay for delivery. Delivery is one flat fee for every order.">Delivery</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (₦)" htmlFor="fee" hint="Leave empty for free delivery.">
            <Input id="fee" inputMode="decimal" value={f.delivery_fee} onChange={setNum('delivery_fee')} placeholder="3500" />
          </Field>
          <Field label="Free delivery from (₦)" htmlFor="free" hint="Orders at or above this amount ship free. Optional.">
            <Input id="free" inputMode="decimal" value={f.free_delivery_threshold} onChange={setNum('free_delivery_threshold')} placeholder="100000" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle hint="Shown in the footer and on the contact page. WhatsApp also gets a chat button on the store.">Contact details</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" htmlFor="wa" hint="With country code, e.g. 2348012345678">
            <Input id="wa" type="tel" inputMode="tel" value={f.whatsapp} onChange={set('whatsapp')} maxLength={25} placeholder="2348012345678" />
          </Field>
          <Field label="Phone number" htmlFor="phone">
            <Input id="phone" type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} maxLength={25} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" inputMode="email" value={f.email} onChange={set('email')} maxLength={120} />
          </Field>
          <Field label="Address (optional)" htmlFor="address">
            <Input id="address" value={f.address} onChange={set('address')} maxLength={200} />
          </Field>
          <Field label="Instagram" htmlFor="ig" hint="Username or link">
            <Input id="ig" value={f.instagram} onChange={set('instagram')} maxLength={120} placeholder="@millacollections" />
          </Field>
          <Field label="TikTok" htmlFor="tt" hint="Username or link">
            <Input id="tt" value={f.tiktok} onChange={set('tiktok')} maxLength={120} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle hint="The large background picture at the top of the home page. Use a wide, landscape photo (at least 1600 px across). Text is placed on top of it.">Home page background photo</CardTitle>
        <ImageUploader images={hero} onChange={setHero} folder="site" max={1} label="Add a photo" aspect="aspect-video" />
      </Card>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 rounded-2xl border border-line bg-paper/95 p-3 shadow-float backdrop-blur lg:bottom-4">
        <Button type="submit" size="lg" className="w-full" loading={pending}>Save settings</Button>
      </div>
    </form>
  );
}
