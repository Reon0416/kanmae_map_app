create table if not exists public.auth_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('signup', 'login', 'email_callback')),
  status text not null,
  email_hash text,
  user_id uuid references auth.users(id) on delete set null,
  role public.app_user_role,
  error_code text,
  error_message text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists auth_events_created_at_idx
  on public.auth_events (created_at desc);

create index if not exists auth_events_email_hash_created_at_idx
  on public.auth_events (email_hash, created_at desc)
  where email_hash is not null;

alter table public.auth_events enable row level security;

create or replace function public.log_auth_event(
  p_event_type text,
  p_status text,
  p_email_hash text default null,
  p_user_id uuid default null,
  p_role public.app_user_role default null,
  p_error_code text default null,
  p_error_message text default null,
  p_ip_address text default null,
  p_user_agent text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.auth_events (
    event_type,
    status,
    email_hash,
    user_id,
    role,
    error_code,
    error_message,
    ip_address,
    user_agent,
    metadata
  )
  values (
    p_event_type,
    p_status,
    p_email_hash,
    p_user_id,
    p_role,
    p_error_code,
    left(p_error_message, 500),
    p_ip_address,
    left(p_user_agent, 500),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.ensure_current_profile(p_display_name text default null)
returns table (
  id uuid,
  display_name text,
  role public.app_user_role
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, display_name, role)
  values (current_user_id, nullif(p_display_name, ''), 'user')
  on conflict (id) do update
    set display_name = coalesce(public.profiles.display_name, excluded.display_name),
        updated_at = now();

  return query
    select profiles.id, profiles.display_name, profiles.role
    from public.profiles
    where profiles.id = current_user_id;
end;
$$;

revoke all on function public.log_auth_event(text, text, text, uuid, public.app_user_role, text, text, text, text, jsonb) from public;
grant execute on function public.log_auth_event(text, text, text, uuid, public.app_user_role, text, text, text, text, jsonb) to anon, authenticated;

revoke all on function public.ensure_current_profile(text) from public;
grant execute on function public.ensure_current_profile(text) to authenticated;
