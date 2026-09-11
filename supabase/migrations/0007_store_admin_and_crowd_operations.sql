create or replace function public.is_current_user_store_admin(p_store_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_admins
    where store_admins.store_id = p_store_id
      and store_admins.user_id = auth.uid()
  );
$$;

create or replace function public.get_current_store_admin_store()
returns table (
  id uuid,
  name text,
  description text,
  genre text,
  price_band text,
  address text,
  lat double precision,
  lng double precision,
  walk_minutes integer,
  hours text,
  closed text,
  accepts_takeout boolean,
  has_student_discount boolean,
  updated_at timestamptz,
  display_status public.display_status,
  wait_time public.wait_time_bucket,
  status_updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    stores.id,
    stores.name,
    stores.description,
    stores.genre,
    stores.price_band,
    stores.address,
    stores.lat,
    stores.lng,
    stores.walk_minutes,
    stores.hours,
    stores.closed,
    stores.accepts_takeout,
    stores.has_student_discount,
    stores.updated_at,
    current_store_status.display_status,
    current_store_status.wait_time,
    current_store_status.updated_at as status_updated_at
  from public.store_admins
  join public.stores on stores.id = store_admins.store_id
  left join public.current_store_status on current_store_status.store_id = stores.id
  where store_admins.user_id = auth.uid()
  order by store_admins.created_at asc
  limit 1;
$$;

create or replace function public.store_admin_update_own_store(
  p_store_id uuid,
  p_name text,
  p_genre text,
  p_hours text,
  p_closed text,
  p_price_band text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_store_admin(p_store_id) then
    raise exception 'Not authorized';
  end if;

  update public.stores
  set name = nullif(trim(p_name), ''),
      genre = coalesce(nullif(trim(p_genre), ''), '未設定'),
      hours = coalesce(nullif(trim(p_hours), ''), '未設定'),
      closed = coalesce(nullif(trim(p_closed), ''), '未設定'),
      price_band = case
        when p_price_band in ('under_800', '800_1200', '1200_1800', 'over_1800') then p_price_band
        else '800_1200'
      end,
      updated_at = now()
  where id = p_store_id;
end;
$$;

create or replace function public.store_admin_update_status(
  p_store_id uuid,
  p_status public.store_status
)
returns table (
  display_status public.display_status,
  wait_time public.wait_time_bucket,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_display_status public.display_status;
  next_wait_time public.wait_time_bucket;
  next_updated_at timestamptz;
begin
  if not public.is_current_user_store_admin(p_store_id) then
    raise exception 'Not authorized';
  end if;

  next_display_status := case p_status
    when 'available' then 'available'::public.display_status
    when 'limited' then 'limited'::public.display_status
    when 'full' then 'full'::public.display_status
    else 'unknown'::public.display_status
  end;

  next_wait_time := case p_status
    when 'available' then 'no_wait'::public.wait_time_bucket
    when 'limited' then 'between_5_10'::public.wait_time_bucket
    when 'full' then 'over_20'::public.wait_time_bucket
    else 'no_wait'::public.wait_time_bucket
  end;

  insert into public.store_status_updates (store_id, status, created_by)
  values (p_store_id, p_status, auth.uid());

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (p_store_id, next_display_status, next_wait_time, 'store', now())
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at
  returning current_store_status.updated_at into next_updated_at;

  return query select next_display_status, next_wait_time, next_updated_at;
end;
$$;

create or replace function public.report_crowd_wait_time(
  p_store_id uuid,
  p_wait_time public.wait_time_bucket
)
returns table (
  display_status public.display_status,
  wait_time public.wait_time_bucket,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_display_status public.display_status;
  next_updated_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  next_display_status := case p_wait_time
    when 'no_wait' then 'available'::public.display_status
    when 'within_5' then 'available'::public.display_status
    when 'between_5_10' then 'limited'::public.display_status
    when 'between_10_20' then 'slightly_crowded'::public.display_status
    when 'over_20' then 'full'::public.display_status
    else 'unknown'::public.display_status
  end;

  insert into public.crowd_reports (store_id, wait_time)
  values (p_store_id, p_wait_time);

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (p_store_id, next_display_status, p_wait_time, 'reports', now())
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at
  returning current_store_status.updated_at into next_updated_at;

  return query select next_display_status, p_wait_time, next_updated_at;
end;
$$;

revoke all on function public.is_current_user_store_admin(uuid) from public;
grant execute on function public.is_current_user_store_admin(uuid) to authenticated;

revoke all on function public.get_current_store_admin_store() from public;
grant execute on function public.get_current_store_admin_store() to authenticated;

revoke all on function public.store_admin_update_own_store(uuid, text, text, text, text, text) from public;
grant execute on function public.store_admin_update_own_store(uuid, text, text, text, text, text) to authenticated;

revoke all on function public.store_admin_update_status(uuid, public.store_status) from public;
grant execute on function public.store_admin_update_status(uuid, public.store_status) to authenticated;

revoke all on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) from public;
grant execute on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) to authenticated;
