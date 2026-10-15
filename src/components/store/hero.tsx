import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button';

/** Brilliant-cut outline drawn in the logo's gold. Shown when no hero photo has been uploaded. */
function DiamondBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_72%_42%,rgb(201_162_39/0.28),transparent_70%)]" />
      <svg
        viewBox="0 0 600 520"
        className="absolute top-1/2 right-[-18%] h-auto w-[135%] -translate-y-[58%] opacity-45 sm:right-[-6%] sm:w-[72%] sm:opacity-100 lg:right-[2%] lg:w-[52%]"
      >
        <defs>
          <linearGradient id="hf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c9a227" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e7cb6c" />
            <stop offset="1" stopColor="#86670d" />
          </linearGradient>
        </defs>
        <path d="M170 60h260l110 110-240 320L60 170Z" fill="url(#hf)" />
        <path d="M170 60 225 170 300 60 375 170 430 60 375 170H225Z" fill="#fff" fillOpacity="0.08" />
        <path d="M225 170 300 490 150 170ZM375 170 300 490 450 170Z" fill="#fff" fillOpacity="0.06" />
        <g fill="none" stroke="url(#hs)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M170 60h260l110 110-240 320L60 170Z" />
          <path d="M60 170h480" />
          <path d="M170 60 225 170 300 60 375 170 430 60M170 60 150 170M430 60 450 170" />
          <path d="M150 170 300 490M225 170 300 490M300 170v320M375 170 300 490M450 170 300 490" />
        </g>
      </svg>
    </div>
  );
}

export function Hero({ imageUrl }: { imageUrl: string | null }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-ink text-white sm:min-h-[40rem] lg:h-[calc(100svh-6rem)] lg:max-h-[54rem]">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/50 to-black/10" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-transparent to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10">
          <DiamondBackdrop />
        </div>
      )}

      <div className="container-page pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl">
          <h1 id="hero-title" className="animate-rise font-display text-[2.75rem] leading-[1.05] tracking-[0.01em] sm:text-6xl lg:text-7xl">
            Jewelry made to be remembered.
          </h1>
          <p className="mt-6 max-w-lg animate-rise text-lg text-white/80 [animation-delay:150ms]">
            Chains, pendants and iced-out pieces. Or send us a photo and we&rsquo;ll set it in a pendant of its own.
          </p>
          <div className="mt-9 flex animate-rise flex-col gap-3 [animation-delay:300ms] sm:flex-row">
            <ButtonLink href="/shop" size="lg" variant="gold">Shop the collection</ButtonLink>
            <ButtonLink href="/shop?custom=1" size="lg" variant="light">Custom photo pendants</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
