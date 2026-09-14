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
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.crowd_reports as old_report
  where old_report.created_at < now() - interval '30 days';

  insert into public.crowd_reports (store_id, wait_time, created_by)
  values (p_store_id, p_wait_time, auth.uid());

  with latest_user_reports as (
    select distinct on (coalesce(report.created_by::text, report.id::text))
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
    order by coalesce(report.created_by::text, report.id::text), report.created_at desc
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

revoke all on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) from public;
grant execute on function public.report_crowd_wait_time(uuid, public.wait_time_bucket) to authenticated;
