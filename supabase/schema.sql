-- ============================================================================
--  Mila Collections – database schema
--  Run this whole file once in: Supabase Dashboard → SQL Editor → New query → Run
--  It is safe to run again later (it only creates what is missing).
-- ============================================================================

-- ─── Profiles (one per signed-up user) ──────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically whenever someone signs up (email or Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Back-fill profiles for anyone who signed up before this ran
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')
from auth.users u
on conflict (id) do nothing;

-- Is the current user an admin? (security definer so it can read profiles inside policies)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ─── Categories ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  image_url    text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── Products ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  description          text,
  price                numeric(12,2) not null check (price >= 0),
  compare_at_price     numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  category_id          uuid references public.categories(id) on delete set null,
  images               text[] not null default '{}',
  is_active            boolean not null default true,
  is_featured          boolean not null default false,
  in_stock             boolean not null default true,
  -- customer-photo products (photo pendant, ice pendant with photo, …)
  is_customizable      boolean not null default false,
  back_side_price      numeric(12,2) not null default 0 check (back_side_price >= 0),
  custom_instructions  text,
  -- [{ "name": "Length", "values": [{ "label": "20 inch", "price_delta": 0 }] }]
  options              jsonb not null default '[]'::jsonb,
  sold_count           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_created_idx on public.products (is_active, created_at desc);
create index if not exists products_sold_idx on public.products (sold_count desc);

-- ─── Store settings (always exactly one row) ────────────────────────────────
create table if not exists public.store_settings (
  id                       integer primary key default 1 check (id = 1),
  announcement             text,   -- no longer shown on the site
  whatsapp                 text,
  phone                    text,
  email                    text,
  address                  text,
  instagram                text,
  tiktok                   text,
  delivery_fee             numeric(12,2) not null default 0 check (delivery_fee >= 0),
  free_delivery_threshold  numeric(12,2) check (free_delivery_threshold is null or free_delivery_threshold > 0),
  hero_image_url           text,
  updated_at               timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ─── Orders ─────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        bigint generated always as identity (start with 1001),
  user_id             uuid references auth.users(id) on delete set null,
  status              text not null default 'pending_payment'
                      check (status in ('pending_payment', 'received', 'in_production', 'shipped', 'delivered', 'cancelled')),
  payment_status      text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed')),
  subtotal            numeric(12,2) not null,
  delivery_fee        numeric(12,2) not null default 0,
  total               numeric(12,2) not null,
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,
  address             text not null,
  city                text not null,
  state               text not null,
  delivery_note       text,
  paystack_reference  text unique,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (payment_status, status, created_at desc);

create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid references public.products(id) on delete set null,
  product_name      text not null,
  product_image     text,
  unit_price        numeric(12,2) not null,
  quantity          integer not null check (quantity > 0),
  line_total        numeric(12,2) not null,
  options           jsonb not null default '[]'::jsonb,
  is_custom         boolean not null default false,
  custom_sides      text check (custom_sides in ('front', 'front_and_back')),
  front_photo_path  text,
  back_photo_path   text,
  custom_note       text
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ─── Contact messages ───────────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ─── Saved delivery addresses (address book) ────────────────────────────────
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null,
  phone       text not null,
  address     text not null,
  landmark    text,
  city        text not null,
  state       text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id, created_at desc);

alter table public.addresses enable row level security;

drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses for select to authenticated using (user_id = auth.uid());
drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses for delete to authenticated using (user_id = auth.uid());

-- ─── Mark an order paid (called only by the server, after Paystack confirms) ─
create or replace function public.mark_order_paid(p_order_id uuid, p_reference text, p_amount_kobo bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then return false; end if;
  if o.payment_status = 'paid' then return true; end if;              -- already done (webhook + callback both call this)
  if o.paystack_reference is distinct from p_reference then return false; end if;
  if round(o.total * 100)::bigint <> p_amount_kobo then return false; end if;

  update public.orders
     set payment_status = 'paid',
         paid_at = now(),
         status = case when status = 'pending_payment' then 'received' else status end
   where id = p_order_id;

  -- bump "best seller" counters once, at the moment of payment
  update public.products p
     set sold_count = p.sold_count + s.qty
    from (
      select product_id, sum(quantity)::int as qty
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    ) s
   where p.id = s.product_id;

  return true;
end;
$$;

revoke all on function public.mark_order_paid(uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text, bigint) to service_role;

-- ============================================================================
--  Row Level Security – who may read / change what
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.messages       enable row level security;

-- profiles: you see and edit yourself (name + phone only); admins see everyone
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;   -- nobody can make themselves admin

-- categories & products: everyone reads what is active; only admins write
drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- store settings: public info; only admins edit
drop policy if exists "settings_read" on public.store_settings;
create policy "settings_read" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "settings_admin_write" on public.store_settings;
create policy "settings_admin_write" on public.store_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders: customers see their own; admins see and update all.
-- Orders are CREATED only by the server (service role), never by the browser.
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- messages: written by the server (contact form), read and managed by admins
drop policy if exists "messages_admin_all" on public.messages;
create policy "messages_admin_all" on public.messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
--  Storage buckets
--    product-images  → public (shop photos)
--    customer-photos → private (photos customers upload for custom pieces)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-photos', 'customer-photos', false, 15728640, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 15728640, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- product-images: anyone can view (public bucket); only admins change
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product_images_admin_select" on storage.objects;
create policy "product_images_admin_select" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- customer-photos: files live in a folder named after the user's id.
-- Customers can upload and see their own; admins can see all.
drop policy if exists "customer_photos_insert_own" on storage.objects;
create policy "customer_photos_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'customer-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "customer_photos_select" on storage.objects;
create policy "customer_photos_select" on storage.objects for select to authenticated
  using (bucket_id = 'customer-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
-- a customer may remove a photo only until it is attached to an order
drop policy if exists "customer_photos_delete_own" on storage.objects;
create policy "customer_photos_delete_own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'customer-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
      select 1 from public.order_items oi
      where oi.front_photo_path = name or oi.back_photo_path = name
    )
  );

-- ============================================================================
--  After you sign up on the site, make yourself (or your client) an admin:
--
--    update public.profiles set role = 'admin' where email = 'CLIENT_EMAIL_HERE';
--
-- ============================================================================
