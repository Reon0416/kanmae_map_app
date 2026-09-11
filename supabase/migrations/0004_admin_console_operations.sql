create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

create or replace function public.admin_update_store(
  p_store_id uuid,
  p_name text,
  p_hours text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  update public.stores
  set name = nullif(trim(p_name), ''),
      hours = coalesce(nullif(trim(p_hours), ''), '未設定'),
      updated_at = now()
  where id = p_store_id;

  if not found then
    raise exception 'Store not found';
  end if;
end;
$$;

create or replace function public.admin_create_store(
  p_name text,
  p_hours text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created_store_id uuid;
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  insert into public.stores (
    name,
    description,
    genre,
    price_band,
    address,
    lat,
    lng,
    walk_minutes,
    hours,
    closed,
    accepts_takeout,
    has_student_discount
  )
  values (
    nullif(trim(p_name), ''),
    '関大前エリアの飲食店です。',
    '未設定',
    '800_1200',
    '大阪府吹田市千里山東',
    34.7732,
    135.5073,
    5,
    coalesce(nullif(trim(p_hours), ''), '未設定'),
    '未設定',
    false,
    false
  )
  returning id into created_store_id;

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (created_store_id, 'unknown', 'no_wait', 'admin', now())
  on conflict (store_id) do nothing;

  return created_store_id;
end;
$$;

create or replace function public.admin_update_wait_time(
  p_store_id uuid,
  p_wait_time public.wait_time_bucket
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_display_status public.display_status;
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  next_display_status := case p_wait_time
    when 'no_wait' then 'available'::public.display_status
    when 'within_5' then 'available'::public.display_status
    when 'between_5_10' then 'limited'::public.display_status
    when 'between_10_20' then 'slightly_crowded'::public.display_status
    when 'over_20' then 'full'::public.display_status
    else 'unknown'::public.display_status
  end;

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (p_store_id, next_display_status, p_wait_time, 'admin', now())
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

revoke all on function public.admin_update_store(uuid, text, text) from public;
grant execute on function public.admin_update_store(uuid, text, text) to authenticated;

revoke all on function public.admin_create_store(text, text) from public;
grant execute on function public.admin_create_store(text, text) to authenticated;

revoke all on function public.admin_update_wait_time(uuid, public.wait_time_bucket) from public;
grant execute on function public.admin_update_wait_time(uuid, public.wait_time_bucket) to authenticated;
