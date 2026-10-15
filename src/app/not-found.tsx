import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl font-medium">We couldn&rsquo;t find that page</h1>
        <p className="mt-3 text-slate">The link may be old or mistyped.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-8 font-semibold text-white">Back to Mila Collections</Link>
      </div>
    </div>
  );
}
