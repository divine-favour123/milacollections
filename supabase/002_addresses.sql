-- Run this once in the Supabase SQL editor if your project already exists.
-- (A fresh install gets the same table from schema.sql.)

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
