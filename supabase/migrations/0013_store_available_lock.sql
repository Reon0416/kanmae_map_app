alter table public.current_store_status
  add column if not exists owner_wait_time_lock_until timestamptz;

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

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until)
  values (p_store_id, next_display_status, p_wait_time, 'admin', now(), null)
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at,
        owner_wait_time_lock_until = excluded.owner_wait_time_lock_until;
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
  next_lock_until timestamptz;
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

  next_lock_until := case
    when p_status = 'available' then now() + interval '3 minutes'
    else null
  end;

  insert into public.store_status_updates (store_id, status, created_by)
  values (p_store_id, p_status, auth.uid());

  insert into public.current_store_status (
    store_id,
    display_status,
    wait_time,
    source,
    updated_at,
    owner_wait_time_lock_until
  )
  values (p_store_id, next_display_status, next_wait_time, 'store', now(), next_lock_until)
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at,
        owner_wait_time_lock_until = excluded.owner_wait_time_lock_until
  returning current_store_status.updated_at into next_updated_at;

  return query select next_display_status, next_wait_time, next_updated_at;
end;
$$;

create or replace function public.report_anonymous_crowd_wait_time(
  p_store_id uuid,
  p_wait_time public.wait_time_bucket,
  p_visitor_hash text
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
  active_lock_until timestamptz;
begin
  if p_visitor_hash is null or length(trim(p_visitor_hash)) < 32 then
    raise exception 'Invalid visitor';
  end if;

  delete from public.crowd_reports as old_report
  where old_report.store_id = p_store_id
    and old_report.anonymous_visitor_hash = p_visitor_hash
    and old_report.created_at >= now() - interval '90 minutes';

  insert into public.crowd_reports (store_id, wait_time, created_by, anonymous_visitor_hash)
  values (p_store_id, p_wait_time, null, p_visitor_hash);

  select current_store_status.owner_wait_time_lock_until
  into active_lock_until
  from public.current_store_status
  where current_store_status.store_id = p_store_id;

  if active_lock_until is not null and active_lock_until > now() then
    return query
      select
        current_store_status.display_status,
        current_store_status.wait_time,
        current_store_status.updated_at
      from public.current_store_status
      where current_store_status.store_id = p_store_id;
    return;
  end if;

  with latest_visitor_reports as (
    select distinct on (coalesce(report.created_by::text, report.anonymous_visitor_hash, report.id::text))
      report.wait_time,
      case report.wait_time
        when 'no_wait' then 0
        when 'within_5' then 1
        when 'between_5_10' then 2
        when 'between_10_20' then 3
        when 'over_20' then 4
        else 0
      end as wait_score
    from public.crowd_reports as report
    where report.store_id = p_store_id
      and report.created_at >= now() - interval '30 minutes'
    order by coalesce(report.created_by::text, report.anonymous_visitor_hash, report.id::text), report.created_at desc
  ),
  ranked_reports as (
    select
      latest_visitor_reports.wait_time,
      row_number() over (order by latest_visitor_reports.wait_score, latest_visitor_reports.wait_time::text) as row_number,
      count(*) over () as report_count
    from latest_visitor_reports
  )
  select ranked_reports.wait_time
  into next_wait_time
  from ranked_reports
  where ranked_reports.row_number = floor(ranked_reports.report_count / 2.0)::int + 1
  limit 1;

  next_wait_time := coalesce(next_wait_time, 'no_wait'::public.wait_time_bucket);

  next_display_status := case next_wait_time
    when 'no_wait' then 'available'::public.display_status
    when 'within_5' then 'available'::public.display_status
    when 'between_5_10' then 'limited'::public.display_status
    when 'between_10_20' then 'slightly_crowded'::public.display_status
    when 'over_20' then 'full'::public.display_status
    else 'unknown'::public.display_status
  end;

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until)
  values (p_store_id, next_display_status, next_wait_time, 'reports', now(), null)
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at,
        owner_wait_time_lock_until = excluded.owner_wait_time_lock_until
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
  next_wait_time public.wait_time_bucket;
  next_updated_at timestamptz;
  active_lock_until timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.crowd_reports (store_id, wait_time, created_by)
  values (p_store_id, p_wait_time, auth.uid());

  select current_store_status.owner_wait_time_lock_until
  into active_lock_until
  from public.current_store_status
  where current_store_status.store_id = p_store_id;

  if active_lock_until is not null and active_lock_until > now() then
    return query
      select
        current_store_status.display_status,
        current_store_status.wait_time,
        current_store_status.updated_at
      from public.current_store_status
      where current_store_status.store_id = p_store_id;
    return;
  end if;

  with latest_user_reports as (
    select distinct on (coalesce(report.created_by::text, report.anonymous_visitor_hash, report.id::text))
      report.wait_time,
      case report.wait_time
        when 'no_wait' then 0
        when 'within_5' then 1
        when 'between_5_10' then 2
        when 'between_10_20' then 3
        when 'over_20' then 4
        else 0
      end as wait_score
    from public.crowd_reports as report
    where report.store_id = p_store_id
      and report.created_at >= now() - interval '30 minutes'
    order by coalesce(report.created_by::text, report.anonymous_visitor_hash, report.id::text), report.created_at desc
  ),
  ranked_reports as (
    select
      latest_user_reports.wait_time,
      row_number() over (order by latest_user_reports.wait_score, latest_user_reports.wait_time::text) as row_number,
      count(*) over () as report_count
    from latest_user_reports
  )
  select ranked_reports.wait_time
  into next_wait_time
  from ranked_reports
  where ranked_reports.row_number = floor(ranked_reports.report_count / 2.0)::int + 1
  limit 1;

  next_wait_time := coalesce(next_wait_time, 'no_wait'::public.wait_time_bucket);

  next_display_status := case next_wait_time
    when 'no_wait' then 'available'::public.display_status
    when 'within_5' then 'available'::public.display_status
    when 'between_5_10' then 'limited'::public.display_status
    when 'between_10_20' then 'slightly_crowded'::public.display_status
    when 'over_20' then 'full'::public.display_status
    else 'unknown'::public.display_status
  end;

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until)
  values (p_store_id, next_display_status, next_wait_time, 'reports', now(), null)
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at,
        owner_wait_time_lock_until = excluded.owner_wait_time_lock_until
  returning current_store_status.updated_at into next_updated_at;

  return query select next_display_status, next_wait_time, next_updated_at;
end;
$$;

revoke all on function public.store_admin_update_status(uuid, public.store_status) from public;
grant execute on function public.store_admin_update_status(uuid, public.store_status) to authenticated;

revoke all on function public.admin_update_wait_time(uuid, public.wait_time_bucket) from public;
grant execute on function public.admin_update_wait_time(uuid, public.wait_time_bucket) to authenticated;

revoke all on function public.report_anonymous_crowd_wait_time(uuid, public.wait_time_bucket, text) from public;
grant execute on function public.report_anonymous_crowd_wait_time(uuid, public.wait_time_bucket, text) to anon, authenticated;

revoke all on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) from public;
grant execute on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) to authenticated;
