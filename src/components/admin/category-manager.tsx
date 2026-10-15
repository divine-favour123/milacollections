'use client';

import { Gem, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteCategory, saveCategory, setCategoryActive } from '@/app/admin/actions';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { Drawer } from '@/components/ui/drawer';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Input, Switch, Textarea } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export type CategoryRow = Category & { product_count: number };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRow | 'new' | null>(null);
  const [pending, start] = useTransition();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string[]>([]);
  const [sort, setSort] = useState('0');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function openEditor(c: CategoryRow | 'new') {
    setEditing(c);
    setError(null);
    if (c === 'new') {
      setName('');
      setDescription('');
      setImage([]);
      setSort(String((categories.at(-1)?.sort_order ?? 0) + 1));
      setActive(true);
    } else {
      setName(c.name);
      setDescription(c.description ?? '');
      setImage(c.image_url ? [c.image_url] : []);
      setSort(String(c.sort_order));
      setActive(c.is_active);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveCategory(
        { name, description, image_url: image[0] ?? null, sort_order: Math.max(0, parseInt(sort, 10) || 0), is_active: active },
        editing && editing !== 'new' ? editing.id : undefined,
      );
      if (!res.ok) return setError(res.error);
      toast.success(editing === 'new' ? 'Category added' : 'Category saved');
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => openEditor('new')}>
          <Plus className="size-4" aria-hidden /> Add category
        </Button>
      </div>

      {categories.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <li key={c.id} className={cn('flex items-center gap-3.5 rounded-2xl border border-line bg-paper p-3.5', !c.is_active && 'opacity-70')}>
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-frost">
                {c.image_url ? <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover" /> : <span className="grid size-full place-items-center text-line-strong"><Gem className="size-6" aria-hidden /></span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-sm text-slate">{c.product_count} {c.product_count === 1 ? 'product' : 'products'}{!c.is_active ? ' · Hidden' : ''}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  start(async () => {
                    const res = await setCategoryActive(c.id, !c.is_active);
                    if (!res.ok) toast.error(res.error);
                    else router.refresh();
                  })
                }
                role="switch"
                aria-checked={c.is_active}
                aria-label={`Show ${c.name} in the store`}
                className={cn('min-h-9 rounded-full px-3 text-xs font-semibold', c.is_active ? 'bg-success-soft text-success' : 'bg-frost text-slate')}
              >
                {c.is_active ? 'Visible' : 'Hidden'}
              </button>
              <button type="button" onClick={() => openEditor(c)} aria-label={`Edit ${c.name}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-frost hover:bg-frost-deep">
                <Pencil className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No categories yet" description="Categories like Chains, Pendants or Ice help customers browse. Add your first one." action={<Button onClick={() => openEditor('new')}>Add a category</Button>} />
      )}

      <Drawer open={editing !== null} onClose={() => !pending && setEditing(null)} title={editing === 'new' ? 'Add category' : 'Edit category'} side="bottom">
        <form onSubmit={submit} className="space-y-4 px-5 pt-4 pb-6">
          {error ? <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p> : null}
          <Field label="Name" htmlFor="cat-name">
            <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Ice pendants" />
          </Field>
          <Field label="Short description (optional)" htmlFor="cat-desc" hint="Shown at the top of the category page and in Google.">
            <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} className="min-h-24" />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Photo</p>
            <ImageUploader images={image} onChange={setImage} folder="categories" max={1} label="Add a photo" />
          </div>
          <Field label="Order in the menu" htmlFor="cat-sort" hint="Smaller numbers come first.">
            <Input id="cat-sort" inputMode="numeric" value={sort} onChange={(e) => setSort(e.target.value.replace(/\D/g, ''))} className="w-28" />
          </Field>
          <Switch checked={active} onChange={setActive} label="Show in the store" />
          <div className="flex gap-3 pt-2">
            {editing && editing !== 'new' ? (
              <ConfirmButton
                title={`Delete “${editing.name}”?`}
                description="Products in this category are kept but will have no category."
                confirmLabel="Delete category"
                onConfirm={async () => {
                  const res = await deleteCategory(editing.id);
                  if (!res.ok) return void toast.error(res.error);
                  toast.success('Category deleted');
                  setEditing(null);
                  router.refresh();
                }}
                size="icon"
                className="size-12"
              >
                <Trash2 className="size-5" aria-label="Delete category" />
              </ConfirmButton>
            ) : null}
            <Button type="submit" size="lg" className="flex-1" loading={pending}>Save category</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
