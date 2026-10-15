'use client';

import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ACCEPTED_IMAGE_TYPES, compressImage, randomId, validateImageFile } from '@/lib/image';
import { createClient } from '@/lib/supabase/client';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Uploads straight from the phone to Supabase Storage (after shrinking the photo),
 * so big camera pictures don't use up mobile data or hit server size limits.
 */
export function ImageUploader({
  images,
  onChange,
  folder,
  max = 10,
  label = 'Add photos',
  aspect = 'aspect-square',
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder: 'products' | 'categories' | 'site';
  max?: number;
  label?: string;
  aspect?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const single = max === 1;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - images.length + (single ? images.length : 0);
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > list.length) toast.info(`You can add up to ${max} photo${max === 1 ? '' : 's'}.`);

    const supabase = createClient();
    setPending(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(`${file.name}: ${problem}`);
        setPending((n) => n - 1);
        continue;
      }
      try {
        const blob = await compressImage(file, { maxSize: 1600, quality: 0.86 });
        const path = `${folder}/${randomId()}.jpg`;
        const { error } = await supabase.storage.from(site.buckets.products).upload(path, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
          upsert: false,
        });
        if (error) throw error;
        uploaded.push(supabase.storage.from(site.buckets.products).getPublicUrl(path).data.publicUrl);
      } catch (e) {
        toast.error(`Could not upload ${file.name}. ${(e as Error).message}`);
      } finally {
        setPending((n) => n - 1);
      }
    }
    if (uploaded.length) onChange(single ? uploaded.slice(-1) : [...images, ...uploaded]);
    if (inputRef.current) inputRef.current.value = '';
  }

  const makeMain = (i: number) => onChange([images[i], ...images.filter((_, idx) => idx !== i)]);
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      <ul className={cn('grid gap-3', single ? 'max-w-48 grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}>
        {images.map((src, i) => (
          <li key={src} className={cn('relative overflow-hidden rounded-2xl bg-frost', aspect)}>
            <Image src={src} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
            {!single && i === 0 ? (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">
                <Star className="size-3" aria-hidden /> Main
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-ink/70 to-transparent p-2 pt-8">
              {!single && i !== 0 ? (
                <button type="button" onClick={() => makeMain(i)} className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink">
                  Make main
                </button>
              ) : <span />}
              <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} className="grid size-8 place-items-center rounded-full bg-white/95 text-danger">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: pending }).map((_, i) => (
          <li key={`p${i}`} className={cn('grid place-items-center rounded-2xl bg-frost', aspect)} aria-label="Uploading">
            <Loader2 className="size-6 animate-spin text-slate" aria-hidden />
          </li>
        ))}
        {pending === 0 && (single ? images.length === 0 : images.length < max) ? (
          <li>
            <label
              htmlFor={id}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line-strong bg-paper text-center text-sm font-semibold text-slate transition-colors hover:border-ink hover:text-ink',
                aspect,
              )}
            >
              <ImagePlus className="size-6" aria-hidden />
              {label}
            </label>
          </li>
        ) : null}
      </ul>
      {single && images.length > 0 && pending === 0 ? (
        <label htmlFor={id} className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-semibold hover:border-ink">
          <ImagePlus className="size-4" aria-hidden /> Replace photo
        </label>
      ) : null}
      <input id={id} ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} multiple={!single} className="sr-only" onChange={(e) => void handleFiles(e.target.files)} />
    </div>
  );
}
