-- Run this in Supabase SQL editor.
-- Ensures:
-- 1) anyone can view car listings
-- 2) only authenticated dealers can insert
-- 3) only listing owner can update/delete

-- Optional: add owner column if missing.
alter table public.dealer_listings
add column if not exists owner_id uuid references auth.users(id);

-- Required for policy checks and ownership guards.
alter table public.dealer_listings enable row level security;

-- Drop old versions if they exist.
drop policy if exists "Public can view listings" on public.dealer_listings;
drop policy if exists "Authenticated dealers can insert listings" on public.dealer_listings;
drop policy if exists "Owners can update their own listings" on public.dealer_listings;
drop policy if exists "Owners can delete their own listings" on public.dealer_listings;

-- Public read access for marketplace browsing.
create policy "Public can view listings"
on public.dealer_listings
for select
to public
using (true);

-- Authenticated user must have a dealer profile and can only create rows for self.
create policy "Authenticated dealers can insert listings"
on public.dealer_listings
for insert
to authenticated
with check (
  auth.uid() is not null
  and owner_id = auth.uid()
  and exists (
    select 1
    from public.dealers d
    where d.user_id = auth.uid()
  )
);

-- Only listing owner can update.
create policy "Owners can update their own listings"
on public.dealer_listings
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Only listing owner can delete.
create policy "Owners can delete their own listings"
on public.dealer_listings
for delete
to authenticated
using (owner_id = auth.uid());
