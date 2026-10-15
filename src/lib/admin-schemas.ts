import { z } from 'zod';

export const optionSchema = z.object({
  name: z.string().trim().min(1, 'Give each option a name, like "Length"').max(40),
  values: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Each option choice needs a label').max(40),
        price_delta: z.number().finite().min(-10_000_000).max(10_000_000),
      }),
    )
    .min(1, 'Add at least one choice to each option')
    .max(12),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Give the product a name').max(140),
  description: z.string().trim().max(4000),
  price: z.number({ error: 'Enter a price' }).finite().min(1, 'Price must be at least ₦1').max(1_000_000_000),
  compare_at_price: z.number().finite().positive().max(1_000_000_000).nullable(),
  category_id: z.string().uuid().nullable(),
  images: z.array(z.string().url()).max(10, 'You can add up to 10 photos'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  in_stock: z.boolean(),
  is_customizable: z.boolean(),
  back_side_price: z.number().finite().min(0).max(1_000_000_000),
  custom_instructions: z.string().trim().max(500),
  options: z.array(optionSchema).max(5, 'Up to 5 options per product'),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Give the category a name').max(60),
  description: z.string().trim().max(400),
  image_url: z.string().url().nullable(),
  sort_order: z.number().int().min(0).max(9999),
  is_active: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

const optionalText = (max: number) => z.string().trim().max(max).transform((v) => v || null);

export const settingsSchema = z.object({
  announcement: optionalText(140),
  whatsapp: optionalText(25),
  phone: optionalText(25),
  email: z.string().trim().email('Enter a valid email').max(120).or(z.literal('')).transform((v) => v || null),
  address: optionalText(200),
  instagram: optionalText(120),
  tiktok: optionalText(120),
  delivery_fee: z.number().finite().min(0).max(10_000_000),
  free_delivery_threshold: z.number().finite().positive().max(1_000_000_000).nullable(),
  hero_image_url: z.string().url().nullable(),
});
export type SettingsInput = z.input<typeof settingsSchema>;
