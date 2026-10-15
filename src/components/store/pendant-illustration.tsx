/** Simple front/back pendant drawing for the custom-photo section. */
function Pendant({ label, className }: { label: string; className?: string }) {
  return (
    <figure className={className}>
      <svg viewBox="0 0 160 220" role="img" aria-label={`${label} of a photo pendant`} className="h-auto w-full drop-shadow-[0_18px_22px_rgb(14_22_33/0.18)]">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dfa2" />
            <stop offset="0.5" stopColor="#b98f33" />
            <stop offset="1" stopColor="#8a6a1e" />
          </linearGradient>
          <linearGradient id={`p-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9edf2" />
            <stop offset="1" stopColor="#cfd6df" />
          </linearGradient>
        </defs>
        <path d="M80 4c-14 0-22 8-22 20v10h12V24c0-5 4-9 10-9s10 4 10 9v10h12V24C102 12 94 4 80 4Z" fill={`url(#g-${label})`} />
        <path d="M80 30c40 0 66 22 66 62v52c0 36-26 66-66 66s-66-30-66-66V92c0-40 26-62 66-62Z" fill={`url(#g-${label})`} />
        <path d="M80 42c33 0 54 18 54 52v50c0 30-21 54-54 54s-54-24-54-54V94c0-34 21-52 54-52Z" fill={`url(#p-${label})`} />
        <circle cx="80" cy="98" r="22" fill="#fff" opacity="0.95" />
        <path d="M38 190c4-34 22-52 42-52s38 18 42 52c-12 10-26 15-42 15s-30-5-42-15Z" fill="#fff" opacity="0.95" />
      </svg>
      <figcaption className="mt-3 text-center text-sm font-semibold text-gold-deep">{label}</figcaption>
    </figure>
  );
}

export function PendantIllustration() {
  return (
    <div className="mx-auto flex max-w-sm items-end justify-center gap-5" aria-hidden={false}>
      <Pendant label="Front" className="w-[46%] -rotate-6" />
      <Pendant label="Back" className="w-[46%] translate-y-6 rotate-6" />
    </div>
  );
}
