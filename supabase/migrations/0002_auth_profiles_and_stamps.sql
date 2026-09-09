do $$ begin
  create type public.app_user_role as enum ('user', 'store', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_store_stamp_counts (
  user_id uuid not null references auth.users(id) on delete cascade,
  store_key text not null,
  store_name text not null,
  stamp_count integer not null default 0 check (stamp_count >= 0),
  last_stamped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

create table if not exists public.stamp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_key text not null,
  store_name text not null,
  wait_time public.wait_time_bucket not null,
  delta integer not null default 1 check (delta <> 0),
  created_at timestamptz not null default now()
);

create index if not exists stamp_events_user_created_at_idx
  on public.stamp_events (user_id, created_at desc);

create index if not exists stamp_events_user_store_created_at_idx
  on public.stamp_events (user_id, store_key, created_at desc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_user_role;
begin
  requested_role := coalesce((new.raw_user_meta_data ->> 'role')::public.app_user_role, 'user');

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    requested_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.record_visit_stamp(
  p_store_key text,
  p_store_name text,
  p_wait_time public.wait_time_bucket
)
returns table (
  event_id uuid,
  stamp_count integer,
  stamped_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  inserted_event_id uuid;
  current_stamp_count integer;
  current_stamped_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.stamp_events (user_id, store_key, store_name, wait_time, delta)
  values (current_user_id, p_store_key, p_store_name, p_wait_time, 1)
  returning id, created_at into inserted_event_id, current_stamped_at;

  insert into public.user_store_stamp_counts (
    user_id,
    store_key,
    store_name,
    stamp_count,
    last_stamped_at
  )
  values (
    current_user_id,
    p_store_key,
    p_store_name,
    1,
    current_stamped_at
  )
  on conflict (user_id, store_key) do update
    set stamp_count = public.user_store_stamp_counts.stamp_count + 1,
        store_name = excluded.store_name,
        last_stamped_at = excluded.last_stamped_at,
        updated_at = now()
  returning public.user_store_stamp_counts.stamp_count into current_stamp_count;

  return query select inserted_event_id, current_stamp_count, current_stamped_at;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_store_stamp_counts enable row level security;
alter table public.stamp_events enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Users can read their own stamp counts" on public.user_store_stamp_counts;
create policy "Users can read their own stamp counts"
  on public.user_store_stamp_counts for select
  using (user_id = auth.uid());

drop policy if exists "Users can read their own stamp events" on public.stamp_events;
create policy "Users can read their own stamp events"
  on public.stamp_events for select
  using (user_id = auth.uid());

revoke all on function public.record_visit_stamp(text, text, public.wait_time_bucket) from public;
grant execute on function public.record_visit_stamp(text, text, public.wait_time_bucket) to authenticated;
