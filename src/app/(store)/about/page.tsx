import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { PageShell } from '@/components/store/page-shell';

export const metadata: Metadata = {
  title: 'About us',
  description: 'Mila Collections sells chains, necklaces, pendants and iced-out jewelry, and makes custom photo pendants to order for customers across Nigeria.',
  alternates: { canonical: '/about' },
};

const points = [
  { title: 'Pieces for every day', text: 'Chains, necklaces, pendants and watches, added to the shop all the time.' },
  { title: 'Made from your photo', text: 'Choose a pendant, upload your picture and we make it for you.' },
  { title: 'Delivered to you', text: 'We deliver across Nigeria. Follow every order from your account.' },
];

export default function AboutPage() {
  return (
    <PageShell title="About us">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display text-3xl leading-snug sm:text-4xl">Jewelry that is made to be worn, noticed and remembered.</p>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate">
          Mila Collections is a jewelry brand for people who like their pieces to stand out. We sell chains, necklaces, pendants and iced-out designs,
          and we make custom photo pendants to order, so you can carry someone or something with you.
        </p>
      </div>

      <ul className="mx-auto mt-16 grid max-w-5xl gap-px border border-line bg-line md:grid-cols-3">
        {points.map((p) => (
          <li key={p.title} className="bg-paper px-7 py-9 text-center">
            <h2 className="font-display text-xl">{p.title}</h2>
            <span aria-hidden className="mx-auto my-4 block h-px w-8 bg-gold" />
            <p className="text-slate">{p.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/shop" size="lg">Shop jewelry</ButtonLink>
        <ButtonLink href="/contact" size="lg" variant="outline">Contact us</ButtonLink>
      </div>
    </PageShell>
  );
}
