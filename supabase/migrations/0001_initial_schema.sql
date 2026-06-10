create extension if not exists pgcrypto;

create type store_status as enum ('available', 'limited', 'full');
create type display_status as enum ('available', 'limited', 'slightly_crowded', 'full', 'stale', 'unknown');
create type wait_time_bucket as enum ('no_wait', 'within_5', 'between_5_10', 'between_10_20', 'over_20');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  genre text not null,
  price_band text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  walk_minutes int not null default 5,
  hours text not null default '',
  closed text not null default '',
  accepts_takeout boolean not null default false,
  has_student_discount boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_admins (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table public.store_status_updates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  status store_status not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.visit_records (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  anonymous_user_id uuid,
  wait_time wait_time_bucket not null,
  time_slot text not null default 'other',
  created_at timestamptz not null default now()
);

create table public.crowd_reports (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  wait_time wait_time_bucket not null,
  created_at timestamptz not null default now()
);

create table public.current_store_status (
  store_id uuid primary key references public.stores(id) on delete cascade,
  display_status display_status not null default 'unknown',
  wait_time wait_time_bucket not null default 'no_wait',
  source text not null default 'unknown',
  updated_at timestamptz not null default now()
);

alter table public.stores enable row level security;
alter table public.store_admins enable row level security;
alter table public.store_status_updates enable row level security;
alter table public.visit_records enable row level security;
alter table public.crowd_reports enable row level security;
alter table public.current_store_status enable row level security;

create policy "Public can read stores" on public.stores for select using (true);
create policy "Public can read current status" on public.current_store_status for select using (true);
create policy "Users can insert visit records" on public.visit_records for insert with check (true);
create policy "Users can insert crowd reports" on public.crowd_reports for insert with check (true);

create policy "Store admins can update their stores"
  on public.stores for update
  using (exists (
    select 1 from public.store_admins
    where store_admins.store_id = stores.id
    and store_admins.user_id = auth.uid()
  ));

create policy "Store admins can insert status updates"
  on public.store_status_updates for insert
  with check (exists (
    select 1 from public.store_admins
    where store_admins.store_id = store_status_updates.store_id
    and store_admins.user_id = auth.uid()
  ));
