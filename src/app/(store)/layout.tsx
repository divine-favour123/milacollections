import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { CartDrawer } from '@/components/store/cart-drawer';
import { CartProvider } from '@/components/store/cart-provider';
import { SiteFooter } from '@/components/store/site-footer';
import { SiteHeader } from '@/components/store/site-header';
import { WhatsAppButton } from '@/components/store/whatsapp-button';
import { getCategories, getSettings } from '@/lib/data';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <AuthProvider>
      <CartProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-5 focus:py-2.5 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <SiteFooter categories={categories} settings={settings} />
        <CartDrawer />
        <WhatsAppButton number={settings.whatsapp} />
      </CartProvider>
    </AuthProvider>
  );
}
