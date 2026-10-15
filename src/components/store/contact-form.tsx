'use client';

import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not send your message.');
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl bg-frost p-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold">Message sent</h2>
        <p className="mt-2 text-slate">Thank you, we&rsquo;ll reply to {form.email} as soon as we can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="c-name"><Input id="c-name" required autoComplete="name" value={form.name} onChange={set('name')} maxLength={100} /></Field>
        <Field label="Email" htmlFor="c-email"><Input id="c-email" type="email" inputMode="email" required autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Phone (optional)" htmlFor="c-phone"><Input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} maxLength={30} /></Field>
        <Field label="Subject (optional)" htmlFor="c-subject"><Input id="c-subject" value={form.subject} onChange={set('subject')} maxLength={150} /></Field>
      </div>
      <Field label="Message" htmlFor="c-message">
        <Textarea id="c-message" required minLength={10} maxLength={3000} value={form.message} onChange={set('message')} className="min-h-36" />
      </Field>
      {/* Honeypot: hidden from people, tempting to bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
      </div>
      <Button type="submit" size="lg" loading={loading}>Send message</Button>
    </form>
  );
}
