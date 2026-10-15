import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource/marcellus';
import './globals.css';
import { site } from '@/lib/site';

const title = `${site.name} | Chains, Pendants & Custom Photo Jewelry in Nigeria`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'jewelry Nigeria',
    'custom photo pendant',
    'iced out pendant',
    'chain necklace',
    'diamond pendant',
    'Mila Collections',
    'buy jewelry online Nigeria',
  ],
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title,
    description: site.description,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
      </body>
    </html>
  );
}
