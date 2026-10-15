'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <h1 className="font-display text-4xl font-medium">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-slate">Please try again. If it keeps happening, message us on WhatsApp and we&rsquo;ll help.</p>
        <Button className="mt-8" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
