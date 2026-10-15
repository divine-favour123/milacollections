import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/store/logo';
import { InstagramIcon, TikTokIcon } from '@/components/ui/social-icons';
import { whatsappLink } from '@/lib/utils';
import type { Category, StoreSettings } from '@/types';

const link = 'text-white/65 transition-colors hover:text-gold-light';
const heading = 'mb-5 font-display text-lg text-white';

export function SiteFooter({ categories, settings }: { categories: Pick<Category, 'id' | 'name' | 'slug'>[]; settings: StoreSettings }) {
  const wa = whatsappLink(settings.whatsapp, 'Hello Mila Collections, I have a question.');
  const insta = settings.instagram ? (settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`) : null;
  const tiktok = settings.tiktok ? (settings.tiktok.startsWith('http') ? settings.tiktok : `https://tiktok.com/@${settings.tiktok.replace('@', '')}`) : null;
  const social = 'grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold-light';

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <Link href="/" aria-label="Mila Collections home" className="inline-block">
            <Logo size={160} className="size-32" />
          </Link>
          <div className="mt-6 flex items-center gap-2.5">
            {insta ? <a href={insta} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={social}><InstagramIcon /></a> : null}
            {tiktok ? <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={social}><TikTokIcon /></a> : null}
            {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={social}><MessageCircle className="size-5" aria-hidden /></a> : null}
          </div>
        </div>

        <nav aria-label="Shop">
          <h2 className={heading}>Shop</h2>
          <ul className="space-y-3">
            <li><Link href="/shop" className={link}>All jewelry</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link href={`/shop?category=${c.slug}`} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className={heading}>Mila Collections</h2>
          <ul className="space-y-3">
            <li><Link href="/about" className={link}>About us</Link></li>
            <li><Link href="/contact" className={link}>Contact us</Link></li>
            <li><Link href="/account" className={link}>Account and orders</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Get in touch</h2>
          <ul className="space-y-3.5 text-white/65">
            {wa ? (
              <li className="flex items-start gap-3"><MessageCircle className="mt-0.5 size-4.5 shrink-0 text-gold" aria-hidden /><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">{settings.whatsapp}</a></li>
            ) : null}
            {settings.phone ? (
              <li className="flex items-start gap-3"><Phone className="mt-0.5 size-4.5 shrink-0 text-gold" aria-hidden /><a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-gold-light">{settings.phone}</a></li>
            ) : null}
            {settings.email ? (
              <li className="flex items-start gap-3"><Mail className="mt-0.5 size-4.5 shrink-0 text-gold" aria-hidden /><a href={`mailto:${settings.email}`} className="break-all hover:text-gold-light">{settings.email}</a></li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-4.5 shrink-0 text-gold" aria-hidden /><span>{settings.address}</span></li>
            ) : null}
            {!wa && !settings.phone && !settings.email && !settings.address ? (
              <li><Link href="/contact" className="hover:text-gold-light">Send us a message</Link></li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-page py-6 text-center text-[0.8125rem] text-white/45">&copy; {new Date().getFullYear()} Mila Collections</p>
      </div>
    </footer>
  );
}
