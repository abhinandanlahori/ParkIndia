-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
--
-- Auth setup (required):
-- 1. Authentication → Providers → Email → turn OFF "Confirm email"
-- 2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Settings → API → service_role)
--    Registration uses /api/auth/register to avoid "email rate limit exceeded"

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null unique,
  vehicle_registration text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parking_spots (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.profiles (id) on delete set null,
  title text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  price_per_day integer not null,
  price_per_night integer not null,
  gate_instructions text not null,
  host_name text not null,
  host_phone text not null,
  layout text not null,
  sector text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles (id) on delete cascade,
  spot_id uuid references public.parking_spots (id) on delete set null,
  spot_snapshot jsonb not null,
  rate_type text not null check (rate_type in ('day', 'night')),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  vehicle_registration text not null,
  driver_name text not null,
  driver_phone text not null,
  booked_at timestamptz not null default now()
);

create index if not exists idx_profiles_phone on public.profiles (phone);
create index if not exists idx_parking_spots_active on public.parking_spots (active);
create index if not exists idx_bookings_driver_status on public.bookings (driver_id, status);

alter table public.profiles enable row level security;
alter table public.parking_spots enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "spots_select_active" on public.parking_spots;
create policy "spots_select_active"
  on public.parking_spots for select
  using (active = true);

drop policy if exists "spots_insert_host" on public.parking_spots;
create policy "spots_insert_host"
  on public.parking_spots for insert
  with check (auth.uid() = host_id);

drop policy if exists "spots_update_host" on public.parking_spots;
create policy "spots_update_host"
  on public.parking_spots for update
  using (auth.uid() = host_id);

drop policy if exists "spots_select_own_host" on public.parking_spots;
create policy "spots_select_own_host"
  on public.parking_spots for select
  using (auth.uid() = host_id);

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = driver_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = driver_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = driver_id);
