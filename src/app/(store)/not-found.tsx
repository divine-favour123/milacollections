import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-7xl text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl font-medium">We couldn&rsquo;t find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-slate">The link may be old, or the piece may have sold out and been removed.</p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/shop">Shop jewelry</ButtonLink>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </div>
  );
}
