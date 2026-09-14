create table if not exists public.anonymous_visitors (
  visitor_hash text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.anonymous_store_stamp_counts (
  visitor_hash text not null references public.anonymous_visitors(visitor_hash) on delete cascade,
  store_key text not null,
  store_name text not null,
  stamp_count integer not null default 0 check (stamp_count >= 0),
  last_stamped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (visitor_hash, store_key)
);

create table if not exists public.anonymous_stamp_events (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null references public.anonymous_visitors(visitor_hash) on delete cascade,
  store_key text not null,
  store_name text not null,
  wait_time public.wait_time_bucket not null,
  delta integer not null default 1 check (delta <> 0),
  created_at timestamptz not null default now()
);

create index if not exists anonymous_stamp_events_visitor_created_at_idx
  on public.anonymous_stamp_events (visitor_hash, created_at desc);

create index if not exists anonymous_stamp_events_visitor_store_created_at_idx
  on public.anonymous_stamp_events (visitor_hash, store_key, created_at desc);

alter table public.crowd_reports
  add column if not exists anonymous_visitor_hash text;

create index if not exists crowd_reports_store_anonymous_created_at_idx
  on public.crowd_reports (store_id, anonymous_visitor_hash, created_at desc)
  where anonymous_visitor_hash is not null;

alter table public.anonymous_visitors enable row level security;
alter table public.anonymous_store_stamp_counts enable row level security;
alter table public.anonymous_stamp_events enable row level security;

create or replace function public.record_anonymous_visit_stamp(
  p_visitor_hash text,
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
  inserted_event_id uuid;
  current_stamp_count integer;
  current_stamped_at timestamptz;
begin
  if p_visitor_hash is null or length(trim(p_visitor_hash)) < 32 then
    raise exception 'Invalid visitor';
  end if;

  insert into public.anonymous_visitors (visitor_hash, last_seen_at)
  values (p_visitor_hash, now())
  on conflict (visitor_hash) do update
    set last_seen_at = excluded.last_seen_at;

  insert into public.anonymous_stamp_events (visitor_hash, store_key, store_name, wait_time, delta)
  values (p_visitor_hash, p_store_key, p_store_name, p_wait_time, 1)
  returning id, created_at into inserted_event_id, current_stamped_at;

  insert into public.anonymous_store_stamp_counts (
    visitor_hash,
    store_key,
    store_name,
    stamp_count,
    last_stamped_at
  )
  values (
    p_visitor_hash,
    p_store_key,
    p_store_name,
    1,
    current_stamped_at
  )
  on conflict (visitor_hash, store_key) do update
    set stamp_count = public.anonymous_store_stamp_counts.stamp_count + 1,
        store_name = excluded.store_name,
        last_stamped_at = excluded.last_stamped_at,
        updated_at = now()
  returning public.anonymous_store_stamp_counts.stamp_count into current_stamp_count;

  return query select inserted_event_id, current_stamp_count, current_stamped_at;
end;
$$;

create or replace function public.get_anonymous_stamp_data(
  p_visitor_hash text,
  p_event_limit integer default 40
)
returns table (
  row_type text,
  id uuid,
  store_key text,
  store_name text,
  stamp_count integer,
  last_stamped_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    'count'::text as row_type,
    null::uuid as id,
    counts.store_key,
    counts.store_name,
    counts.stamp_count,
    counts.last_stamped_at,
    null::timestamptz as created_at
  from public.anonymous_store_stamp_counts as counts
  where counts.visitor_hash = p_visitor_hash

  union all

  select
    'event'::text as row_type,
    events.id,
    events.store_key,
    events.store_name,
    null::integer as stamp_count,
    null::timestamptz as last_stamped_at,
    events.created_at
  from (
    select *
    from public.anonymous_stamp_events
    where anonymous_stamp_events.visitor_hash = p_visitor_hash
    order by anonymous_stamp_events.created_at desc
    limit greatest(1, least(coalesce(p_event_limit, 40), 80))
  ) as events;
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

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (p_store_id, next_display_status, next_wait_time, 'reports', now())
  on conflict (store_id) do update
    set display_status = excluded.display_status,
        wait_time = excluded.wait_time,
        source = excluded.source,
        updated_at = excluded.updated_at
  returning current_store_status.updated_at into next_updated_at;

  return query select next_display_status, next_wait_time, next_updated_at;
end;
$$;

revoke all on function public.record_anonymous_visit_stamp(text, text, text, public.wait_time_bucket) from public;
grant execute on function public.record_anonymous_visit_stamp(text, text, text, public.wait_time_bucket) to anon, authenticated;

revoke all on function public.get_anonymous_stamp_data(text, integer) from public;
grant execute on function public.get_anonymous_stamp_data(text, integer) to anon, authenticated;

revoke all on function public.report_anonymous_crowd_wait_time(uuid, public.wait_time_bucket, text) from public;
grant execute on function public.report_anonymous_crowd_wait_time(uuid, public.wait_time_bucket, text) to anon, authenticated;
