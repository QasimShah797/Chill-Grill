-- Run this once in the Supabase SQL editor, before creating staff accounts.
-- Then: Authentication → Users → Add user (tick "Auto Confirm").
-- The profile row is created automatically. Promote the owner with:
--   update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = 'tabish@chillgrill.com';
--   insert into public.profiles (id, name, email, role)
--   select id, 'Tabish', email, 'ADMIN' from auth.users where email = 'tabish@chillgrill.com'
--   on conflict (id) do update set role = 'ADMIN', name = 'Tabish';
-- Salesman (after the role check below is applied):
--   update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = 'salesman@chillgrill.com';
--   update public.profiles set role = 'SALESMAN', name = 'Salesman' where email = 'salesman@chillgrill.com';

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Staff',
  email text not null default '',
  role text not null default 'CUSTOMER' check (role in ('ADMIN', 'STAFF', 'SALESMAN', 'CUSTOMER'))
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text not null default '',
  "group" text not null,
  sort_order int not null default 0,
  enabled boolean not null default true
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category_id text not null references public.categories (id),
  price numeric not null default 0,
  description text not null default '',
  image_key text not null default '',
  image text,
  gallery jsonb not null default '[]'::jsonb,
  available boolean not null default true,
  featured boolean not null default false,
  popular boolean not null default false,
  archived boolean not null default false,
  price_missing boolean not null default false,
  variants jsonb
);

create table if not exists public.deals (
  id text primary key,
  name text not null,
  items text[] not null default '{}',
  price numeric not null,
  image_key text not null default 'platter',
  image text,
  available boolean not null default true,
  badge text,
  archived boolean not null default false,
  category_id text not null references public.categories (id)
);

create table if not exists public.addons (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  applicable_category_ids text[] not null default '{}',
  available boolean not null default true,
  archived boolean not null default false,
  skip_if_name_includes text
);

create table if not exists public.restaurant_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null
);

create sequence if not exists public.order_seq start 1100;

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null default '',
  area text not null default '',
  order_type text not null check (order_type in ('delivery', 'pickup')),
  payment_method text not null check (payment_method in ('cod', 'pay_at_restaurant')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'new',
  customer_notes text not null default '',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null,
  product_name text not null,
  variant text,
  quantity int not null,
  unit_price numeric not null,
  addons jsonb not null default '[]'::jsonb,
  notes text,
  total numeric not null,
  image text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_idx on public.order_items (order_id);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('ADMIN', 'STAFF', 'SALESMAN')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('ADMIN', 'STAFF', 'SALESMAN', 'CUSTOMER'));
alter table public.profiles alter column role set default 'CUSTOMER';
alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Guest'
    ),
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) = 'tabish@chillgrill.com' then 'ADMIN'
      when lower(coalesce(new.email, '')) = 'salesman@chillgrill.com' then 'SALESMAN'
      else 'CUSTOMER'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        name = case
          when public.profiles.name in ('Staff', 'Guest', '') then excluded.name
          else public.profiles.name
        end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.next_order_code()
returns text
language sql
security definer
set search_path = public
as $$
  select 'CG' || nextval('public.order_seq')::text;
$$;

create or replace function public.sync_order_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.order_items where order_id = new.id;
  insert into public.order_items (order_id, product_id, product_name, variant, quantity, unit_price, addons, notes, total, image)
  select
    new.id,
    item->>'productId',
    item->>'productName',
    nullif(item->>'variant', ''),
    coalesce((item->>'quantity')::int, 1),
    coalesce((item->>'unitPrice')::numeric, 0),
    coalesce(item->'addons', '[]'::jsonb),
    nullif(item->>'notes', ''),
    coalesce((item->>'total')::numeric, 0),
    nullif(item->>'image', '')
  from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) as item;
  return new;
end;
$$;

drop trigger if exists orders_sync_items on public.orders;
create trigger orders_sync_items
  after insert or update of items on public.orders
  for each row execute function public.sync_order_items();

create or replace function public.guard_product_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;
  if public.is_staff() then
    if new.name is distinct from old.name
      or new.category_id is distinct from old.category_id
      or new.price is distinct from old.price
      or new.description is distinct from old.description
      or new.image is distinct from old.image
      or new.gallery is distinct from old.gallery
      or new.featured is distinct from old.featured
      or new.popular is distinct from old.popular
      or new.variants is distinct from old.variants
      or new.archived is distinct from old.archived
    then
      raise exception 'Staff can only change availability';
    end if;
    return new;
  end if;
  raise exception 'Not allowed';
end;
$$;

drop trigger if exists products_guard_update on public.products;
create trigger products_guard_update
  before update on public.products
  for each row execute function public.guard_product_update();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.deals enable row level security;
alter table public.addons enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());

drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select using (true);
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read products" on public.products;
create policy "read products" on public.products for select using (true);
drop policy if exists "admin insert products" on public.products;
create policy "admin insert products" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "staff update products" on public.products;
create policy "staff update products" on public.products for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin delete products" on public.products;
create policy "admin delete products" on public.products for delete to authenticated using (public.is_admin());

drop policy if exists "read deals" on public.deals;
create policy "read deals" on public.deals for select using (true);
drop policy if exists "admin write deals" on public.deals;
create policy "admin write deals" on public.deals for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read addons" on public.addons;
create policy "read addons" on public.addons for select using (true);
drop policy if exists "admin write addons" on public.addons;
create policy "admin write addons" on public.addons for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read settings" on public.restaurant_settings;
create policy "read settings" on public.restaurant_settings for select using (true);
drop policy if exists "admin write settings" on public.restaurant_settings;
create policy "admin write settings" on public.restaurant_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.stamp_order_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_stamp_user on public.orders;
create trigger orders_stamp_user
  before insert on public.orders
  for each row execute function public.stamp_order_user();

drop policy if exists "place orders" on public.orders;
create policy "place orders" on public.orders for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select to authenticated using (user_id = auth.uid());
drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff read order items" on public.order_items;
create policy "staff read order items" on public.order_items for select to authenticated using (public.is_staff());

grant execute on function public.next_order_code() to anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;
