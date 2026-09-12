create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'payment_failed', 'cancelled', 'refunded')),
  currency text not null default 'sgd' check (currency = 'sgd'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  tax_cents integer check (tax_cents is null or tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  contact_email text not null,
  delivery_method text not null check (delivery_method in ('standard', 'priority')),
  delivery_address jsonb not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  cart_item_id uuid,
  product_id text,
  product_snapshot jsonb not null,
  configuration jsonb not null default '{}'::jsonb,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer,
  total_price_cents integer not null check (total_price_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_user_id_idx
  on public.order_items (user_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can view their own order items" on public.order_items;
create policy "Customers can view their own order items"
  on public.order_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

alter table public.customer_files
  add column if not exists order_id uuid references public.orders(id) on delete set null;

create index if not exists customer_files_order_id_idx
  on public.customer_files (order_id);
