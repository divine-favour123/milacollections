'use client';

import { Camera, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { compressImage, randomId, validateImageFile, ACCEPTED_IMAGE_TYPES } from '@/lib/image';
import { createClient } from '@/lib/supabase/client';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

export type UploadedPhoto = { path: string; previewUrl: string };

export function PhotoUploadField({
  label,
  hint,
  userId,
  value,
  onChange,
  error,
}: {
  label: string;
  hint?: string;
  userId: string;
  value: UploadedPhoto | null;
  onChange: (photo: UploadedPhoto | null) => void;
  error?: string | null;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl);
    };
  }, [value]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) return setLocalError(problem);
    setLocalError(null);
    setUploading(true);
    try {
      const blob = await compressImage(file, { maxSize: 2400, quality: 0.92 });
      const path = `${userId}/${randomId()}.jpg`;
      const { error: upErr } = await createClient()
        .storage.from(site.buckets.customerPhotos)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;
      if (value) void createClient().storage.from(site.buckets.customerPhotos).remove([value.path]);
      onChange({ path, previewUrl: URL.createObjectURL(blob) });
    } catch (e) {
      setLocalError((e as Error).message?.includes('row-level security')
        ? 'Please sign in again to upload photos.'
        : 'Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const shownError = localError || error;

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-semibold">{label}</p>
      <div
        className={cn(
          'relative flex items-center gap-4 rounded-2xl border border-dashed p-3 transition-colors',
          shownError ? 'border-danger bg-danger-soft/40' : value ? 'border-line-strong bg-paper' : 'border-line-strong bg-frost/60 hover:border-ink',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          aria-labelledby={`${id}-label`}
          onChange={(e) => void handleFile(e.target.files?.[0])}
          className="sr-only"
          disabled={uploading}
        />
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.previewUrl} alt={`${label} preview`} className="size-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Photo added</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-gold-deep hover:underline">
                  <RefreshCw className="size-3.5" aria-hidden /> Change
                </label>
                <button
                  type="button"
                  onClick={() => {
                    void createClient().storage.from(site.buckets.customerPhotos).remove([value.path]);
                    onChange(null);
                  }}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate hover:text-danger"
                >
                  <X className="size-3.5" aria-hidden /> Remove
                </button>
              </div>
            </div>
          </>
        ) : (
          <label htmlFor={id} className={cn('flex w-full cursor-pointer items-center gap-4', uploading && 'pointer-events-none')}>
            <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-paper text-gold-deep">
              {uploading ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <Camera className="size-6" aria-hidden />}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{uploading ? 'Uploading…' : 'Add a photo'}</span>
              <span className="block text-sm text-slate">{hint ?? 'Take a photo or choose one from your phone.'}</span>
            </span>
          </label>
        )}
        {uploading && value ? (
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-paper/70">
            <Loader2 className="size-6 animate-spin" aria-hidden />
          </span>
        ) : null}
      </div>
      {shownError ? (
        <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-danger">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
