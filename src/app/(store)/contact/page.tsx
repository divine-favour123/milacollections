import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactForm } from '@/components/store/contact-form';
import { PageShell } from '@/components/store/page-shell';
import { getSettings } from '@/lib/data';
import { whatsappLink } from '@/lib/utils';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Message Mila Collections on WhatsApp, phone or email about an order, a custom pendant or any piece in our collection.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, 'Hello Mila Collections, I have a question.');
  const rows = [
    wa && { icon: MessageCircle, label: 'WhatsApp', value: s.whatsapp as string, href: wa },
    s.phone && { icon: Phone, label: 'Phone', value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.email && { icon: Mail, label: 'Email', value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: MapPin, label: 'Find us', value: s.address, href: null },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string | null }[];

  return (
    <PageShell title="Contact us" intro="Questions about an order, a custom pendant or a piece you saw? Send us a message.">
      <div className="grid gap-10 lg:grid-cols-[1fr_21rem] lg:gap-12">
        <ContactForm />
        <aside className="space-y-7 lg:border-l lg:border-line lg:pl-12">
          {rows.length ? (
            rows.map((r) => (
              <div key={r.label} className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-deep"><r.icon className="size-5" aria-hidden /></span>
                <div className="min-w-0">
                  <p className="font-display text-lg">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-words text-slate underline-offset-4 hover:text-ink hover:underline">{r.value}</a>
                  ) : (
                    <p className="text-slate">{r.value}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate">Use the form and we&rsquo;ll reply by email.</p>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
