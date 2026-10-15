'use client';

/**
 * Shrinks phone photos before upload so they don't eat mobile data.
 * Honors EXIF rotation, outputs JPEG. Falls back to the original file if anything goes wrong.
 */
export async function compressImage(file: File, opts: { maxSize?: number; quality?: number } = {}): Promise<Blob> {
  const { maxSize = 1600, quality = 0.86 } = opts;
  try {
    if (!file.type.startsWith('image/')) return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000 && file.type === 'image/jpeg') {
      bitmap.close();
      return file;
    }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
export const MAX_UPLOAD_MB = 15;

export function validateImageFile(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Use a JPG, PNG or WebP photo.';
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `That photo is larger than ${MAX_UPLOAD_MB}MB.`;
  return null;
}

export function randomId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
