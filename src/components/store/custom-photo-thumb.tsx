'use client';

import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

const cache = new Map<string, { url: string; expires: number }>();

/** Shows one of the customer's own private photos using a short-lived signed link. */
export function CustomPhotoThumb({ path, label, className }: { path: string; label: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(() => {
    const hit = cache.get(path);
    return hit && hit.expires > Date.now() ? hit.url : null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hit = cache.get(path);
    if (hit && hit.expires > Date.now()) {
      setUrl(hit.url);
      return;
    }
    let active = true;
    createClient()
      .storage.from(site.buckets.customerPhotos)
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) return setFailed(true);
        cache.set(path, { url: data.signedUrl, expires: Date.now() + 50 * 60 * 1000 });
        setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <span className={cn('grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-frost', className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="size-full object-cover" loading="lazy" />
      ) : failed ? (
        <ImageOff className="size-4 text-mist" aria-label="Photo unavailable" />
      ) : (
        <span className="skeleton size-full" />
      )}
    </span>
  );
}
