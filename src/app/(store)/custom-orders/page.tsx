import type { Metadata } from 'next';
import { PageShell } from '@/components/store/page-shell';
import { PendantIllustration } from '@/components/store/pendant-illustration';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Custom photo pendants',
  description: 'Turn your favourite photo into a custom pendant. Choose front only or front and back, upload your pictures and order online from Mila Collections.',
  alternates: { canonical: '/custom-orders' },
};

const steps = [
  { t: 'Choose a pendant', d: 'Browse the pieces marked “Your photo”. Each one shows its price, and any extra cost for a photo on the back.' },
  { t: 'Pick front, or front and back', d: 'Decide whether you want one photo on the front, or a photo on both sides.' },
  { t: 'Upload your photos', d: 'Take a new photo or choose one from your phone. You can leave us a note about names, wording or which part to focus on.' },
  { t: 'Choose how many', d: 'Set the quantity. If you want a different photo on each pendant, add them to your cart one at a time.' },
  { t: 'Pay securely', d: 'Check out with Paystack. Your order appears in your account straight away.' },
];

const tips = [
  'Use a clear photo that is in focus and well lit.',
  'Put the face or main subject in the middle of the picture.',
  'Avoid heavy filters, stickers and text on the photo.',
  'Larger photos give a sharper result than screenshots.',
];

export default function CustomOrdersPage() {
  return (
    <PageShell title="Custom photo pendants" intro="A pendant with your own photo, made to order.">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="mb-6 text-xl font-semibold">How it works</h2>
          <ol className="space-y-6">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold">{s.t}</p>
                  <p className="text-slate">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 mb-4 text-xl font-semibold">Tips for a great result</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate">
            {tips.map((t) => <li key={t}>{t}</li>)}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/shop?custom=1" size="lg">See photo pendants</ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">Ask a question</ButtonLink>
          </div>
        </div>
        <div className="rounded-[2rem] bg-gold-soft px-6 py-12"><PendantIllustration /></div>
      </div>
    </PageShell>
  );
}
