'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteProduct, saveProduct } from '@/app/admin/actions';
import { ImageUploader } from '@/components/admin/image-uploader';
import { OptionsEditor, type OptionDraft } from '@/components/admin/options-editor';
import { Card, CardTitle } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/form';
import type { Category, Product } from '@/types';

const num = (v: string) => {
  const n = Number(v.replace(/,/g, '').trim());
  return v.trim() === '' || Number.isNaN(n) ? null : n;
};

export function ProductForm({ product, categories }: { product?: Product; categories: Pick<Category, 'id' | 'name'>[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compare, setCompare] = useState(product?.compare_at_price ? String(product.compare_at_price) : '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [custom, setCustom] = useState(product?.is_customizable ?? false);
  const [backPrice, setBackPrice] = useState(product?.back_side_price ? String(product.back_side_price) : '');
  const [instructions, setInstructions] = useState(product?.custom_instructions ?? '');
  const [options, setOptions] = useState<OptionDraft[]>(
    (product?.options ?? []).map((o) => ({ name: o.name, values: o.values.map((v) => ({ label: v.label, delta: v.price_delta ? String(v.price_delta) : '' })) })),
  );
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = num(price);
    if (p == null) return setError('Enter the price in naira.');
    start(async () => {
      const res = await saveProduct(
        {
          name,
          description,
          price: p,
          compare_at_price: num(compare),
          category_id: categoryId || null,
          images,
          is_active: isActive,
          is_featured: isFeatured,
          in_stock: inStock,
          is_customizable: custom,
          back_side_price: num(backPrice) ?? 0,
          custom_instructions: instructions,
          options: options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ label: v.label, price_delta: num(v.delta) ?? 0 })) })),
        },
        product?.id,
      );
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      toast.success(product ? 'Product updated' : 'Product added');
      router.push('/admin/products');
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 font-medium text-danger">{error}</p> : null}

      <Card>
        <CardTitle hint="The first photo is the main one shown in the shop.">Photos</CardTitle>
        <ImageUploader images={images} onChange={setImages} folder="products" />
      </Card>

      <Card>
        <CardTitle>Details</CardTitle>
        <div className="space-y-4">
          <Field label="Product name" htmlFor="name">
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={140} placeholder="e.g. Iced Cuban Link Chain" />
          </Field>
          <Field label="Category" htmlFor="category" hint={categories.length ? undefined : 'Add a category first from the Categories page.'}>
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" htmlFor="description" hint="Materials, size, what makes it special. Shown on the product page and in Google.">
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} className="min-h-36" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle>Pricing</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (₦)" htmlFor="price">
            <Input id="price" required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="25000" />
          </Field>
          <Field label="Old price (₦), optional" htmlFor="compare" hint="Shown crossed out to show a discount.">
            <Input id="compare" inputMode="decimal" value={compare} onChange={(e) => setCompare(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="30000" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle hint="For things like chain length or size. The price above is for the first choice; add extra cost per choice if needed.">Options</CardTitle>
        <OptionsEditor value={options} onChange={setOptions} />
      </Card>

      <Card>
        <CardTitle hint="For pendants where the customer sends photos, like a photo pendant or ice pendant.">Customer photos</CardTitle>
        <Switch checked={custom} onChange={setCustom} label="Customer uploads their own photos" description="They choose quantity, front or front and back, and upload the pictures." />
        {custom ? (
          <div className="mt-4 space-y-4 border-t border-line pt-4">
            <Field label="Extra cost for a photo on the back (₦)" htmlFor="back" hint="Leave empty if front and back cost the same.">
              <Input id="back" inputMode="decimal" value={backPrice} onChange={(e) => setBackPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" />
            </Field>
            <Field label="Instructions for the customer" htmlFor="instructions" hint="Shown above the upload boxes, e.g. photo tips or size guidance.">
              <Textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={500} className="min-h-24" />
            </Field>
          </div>
        ) : null}
      </Card>

      <Card>
        <CardTitle>Visibility</CardTitle>
        <div className="divide-y divide-line">
          <Switch checked={isActive} onChange={setIsActive} label="Show in the store" description="Turn off to hide it without deleting." />
          <Switch checked={inStock} onChange={setInStock} label="In stock" description="Turn off to show it as sold out." />
          <Switch checked={isFeatured} onChange={setIsFeatured} label="Feature on the home page" description="Featured pieces appear under “You may also like”." />
        </div>
      </Card>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-1 flex items-center gap-3 rounded-2xl border border-line bg-paper/95 p-3 shadow-float backdrop-blur lg:bottom-4">
        <Button type="button" variant="soft" onClick={() => router.push('/admin/products')} disabled={pending}>Cancel</Button>
        <Button type="submit" size="lg" className="flex-1" loading={pending}>{product ? 'Save changes' : 'Add product'}</Button>
      </div>

      {product ? (
        <div className="pt-2 text-center">
          <ConfirmButton
            title="Delete this product?"
            description="It will be removed from the store for good. Past orders keep their record of what was bought."
            confirmLabel="Delete product"
            onConfirm={async () => {
              const res = await deleteProduct(product.id);
              if (!res.ok) return void toast.error(res.error);
              toast.success('Product deleted');
              router.push('/admin/products');
              router.refresh();
            }}
          >
            <Trash2 className="size-4" aria-hidden /> Delete product
          </ConfirmButton>
        </div>
      ) : null}
    </form>
  );
}
