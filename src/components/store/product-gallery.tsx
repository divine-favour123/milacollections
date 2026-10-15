'use client';

import { Gem } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="grid aspect-square place-items-center rounded-3xl bg-frost text-line-strong">
        <Gem className="size-16" aria-hidden />
      </div>
    );
  }

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setActive(i);
  };

  return (
    <div>
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== active) setActive(i);
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-frost no-scrollbar"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
      >
        {images.map((src, i) => (
          <div key={src} className="relative aspect-square w-full shrink-0 snap-center sm:aspect-4/5" aria-label={`Photo ${i + 1} of ${images.length}`}>
            <Image
              src={src}
              alt={i === 0 ? name : `${name}, photo ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar" role="tablist" aria-label="Choose photo">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show photo ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-xl bg-frost ring-2 ring-offset-2 transition-shadow sm:size-20',
                i === active ? 'ring-ink' : 'ring-transparent hover:ring-line-strong',
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
