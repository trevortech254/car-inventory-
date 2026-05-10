-- Reproducible schema for marketplace dealer data.
-- Run this before rls_policies.sql in Supabase SQL editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dealer_listings (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null check (year between 1900 and 2100),
  trim text not null default 'Standard',
  mileage integer not null default 0 check (mileage >= 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  status text not null default 'draft' check (status in ('draft', 'live', 'sold')),
  vin_suffix text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dealers_user_id on public.dealers(user_id);
create index if not exists idx_dealers_created_at on public.dealers(created_at desc);

create index if not exists idx_dealer_listings_dealer_id on public.dealer_listings(dealer_id);
create index if not exists idx_dealer_listings_owner_id on public.dealer_listings(owner_id);
create index if not exists idx_dealer_listings_status on public.dealer_listings(status);
create index if not exists idx_dealer_listings_created_at on public.dealer_listings(created_at desc);

alter table public.dealers enable row level security;
alter table public.dealer_listings enable row level security;

drop trigger if exists trg_dealers_set_updated_at on public.dealers;
create trigger trg_dealers_set_updated_at
before update on public.dealers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_dealer_listings_set_updated_at on public.dealer_listings;
create trigger trg_dealer_listings_set_updated_at
before update on public.dealer_listings
for each row
execute function public.set_updated_at();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'inventory'
      and column_name = 'updated_at'
  ) then
    execute 'drop trigger if exists trg_inventory_set_updated_at on public.inventory';
    execute 'create trigger trg_inventory_set_updated_at before update on public.inventory for each row execute function public.set_updated_at()';
  end if;
end;
$$;
