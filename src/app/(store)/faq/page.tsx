import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { JsonLd } from '@/components/json-ld';
import { PageShell } from '@/components/store/page-shell';

export const metadata: Metadata = {
  title: 'Questions and answers',
  description: 'Answers about ordering, paying with Paystack, delivery in Nigeria and how custom photo pendants work at Mila Collections.',
  alternates: { canonical: '/faq' },
};

const faqs = [
  { q: 'How do custom photo pendants work?', a: 'Open a pendant marked “Your photo”, choose how many you want, pick whether the photo goes on the front or on the front and back, then upload your photos. Pay at checkout and we make your piece to order.' },
  { q: 'Can I put a different photo on each pendant?', a: 'Yes. Each pendant in your cart carries its own photos, so add them to your cart one at a time with a different photo each time.' },
  { q: 'What kind of photo works best?', a: 'A clear, well-lit photo where the face or subject is in the middle of the picture. Higher resolution photos give the best result. JPG, PNG and WebP files are supported.' },
  { q: 'Do I need an account to order?', a: 'Yes. An account lets you upload photos safely, pay, and follow your order. You can sign up with your email or with Google in a few seconds.' },
  { q: 'How do I pay?', a: 'Payments are handled by Paystack. You will see the payment methods available on Paystack’s secure page after you tap “Pay securely”. We never see or store your card details.' },
  { q: 'How much is delivery?', a: 'Delivery is shown in your cart and at checkout before you pay. Some orders may qualify for free delivery.' },
  { q: 'Can I change or cancel my order?', a: 'Contact us as soon as possible on WhatsApp or through the contact page. If your order has not been made or shipped yet, we will do our best to help.' },
  { q: 'Who can see the photos I upload?', a: 'Your photos are stored privately. Only you and the Mila Collections team can see them, and we only use them to make your order.' },
];

export default function FaqPage() {
  return (
    <PageShell title="Questions and answers" intro="The things people ask us most.">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-slate transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 text-slate sm:text-[1.0625rem]">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
