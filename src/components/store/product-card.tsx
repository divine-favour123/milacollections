import { Camera, Gem } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [main, second] = product.images;
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const off = onSale ? Math.round((1 - product.price / (product.compare_at_price as number)) * 100) : 0;

  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-frost">
          {main ? (
            <>
              <Image
                src={main}
                alt={product.name}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 33vw, 50vw"
                className={cn('object-cover', !product.in_stock && 'opacity-60')}
              />
              {second ? (
                <Image
                  src={second}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <span className="absolute inset-0 grid place-items-center text-line-strong">
              <Gem className="size-10" aria-hidden />
            </span>
          )}

          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
            {!product.in_stock ? <Badge tone="ink">Sold out</Badge> : null}
            {product.in_stock && onSale ? <Badge tone="gold">{off}% off</Badge> : null}
          </div>
        </div>

        <div className="mt-3.5 space-y-1 text-center">
          {product.category?.name ? <p className="text-xs tracking-[0.12em] text-mist uppercase">{product.category.name}</p> : null}
          <h3 className="line-clamp-2 leading-snug font-medium text-ink">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Price amount={product.price} compareAt={product.compare_at_price} className="text-[0.9375rem]" />
            {product.is_customizable ? (
              <span className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-gold-deep">
                <Camera className="size-3.5" aria-hidden /> Your photo
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
