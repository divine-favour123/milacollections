import { Gem } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types';

export function CategoryTile({ category }: { category: Pick<Category, 'name' | 'slug' | 'image_url'> }) {
  return (
    <Link href={`/shop?category=${category.slug}`} className="group relative block aspect-4/5 overflow-hidden bg-ink">
      {category.image_url ? (
        <Image
          src={category.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 24vw, 50vw"
          className="object-cover opacity-90 transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,rgb(201_162_39/0.3),transparent_65%)] text-gold">
          <Gem className="size-10" strokeWidth={1.25} aria-hidden />
        </span>
      )}
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-5 text-center">
        <span className="font-display text-xl text-white sm:text-2xl">{category.name}</span>
        <span aria-hidden className="mx-auto mt-3 block h-px w-8 bg-gold transition-[width] duration-300 group-hover:w-16" />
      </span>
    </Link>
  );
}
