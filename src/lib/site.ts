const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const site = {
  name: 'Mila Collections',
  shortName: 'Mila',
  tagline: 'Chains, pendants and custom photo jewelry',
  description:
    'Shop chains, necklaces, pendants and iced-out jewelry from Mila Collections, or upload your own photo and have it made into a custom photo pendant. Secure checkout with Paystack and delivery across Nigeria.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || fromVercel || 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_NG',
  currency: 'NGN',
  logo: '/logo.png',
  /** Paths that customers upload custom photos into (private bucket). */
  buckets: { products: 'product-images', customerPhotos: 'customer-photos' },
} as const;

export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
