export type OptionValue = { label: string; price_delta: number };
export type ProductOption = { name: string; values: OptionValue[] };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  is_customizable: boolean;
  back_side_price: number;
  custom_instructions: string | null;
  options: ProductOption[];
  sold_count: number;
  created_at: string;
  updated_at?: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export type StoreSettings = {
  id: number;
  announcement: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  tiktok: string | null;
  delivery_fee: number;
  free_delivery_threshold: number | null;
  hero_image_url: string | null;
};

export type OrderStatus = 'pending_payment' | 'received' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  options: { name: string; value: string }[];
  is_custom: boolean;
  custom_sides: 'front' | 'front_and_back' | null;
  front_photo_path: string | null;
  back_photo_path: string | null;
  custom_note: string | null;
};

export type Order = {
  id: string;
  order_number: number;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  delivery_note: string | null;
  paystack_reference: string | null;
  paid_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
};
