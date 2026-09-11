insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
select stores.id, status_seed.display_status, status_seed.wait_time, 'initial_catalog', now()
from public.stores
join (
  values
    ('麺処　とりとん', 'available'::public.display_status, 'within_5'::public.wait_time_bucket),
    ('つけ麺　雀', 'limited'::public.display_status, 'between_5_10'::public.wait_time_bucket),
    ('きりん寺', 'slightly_crowded'::public.display_status, 'between_10_20'::public.wait_time_bucket),
    ('ラーメン　豚福', 'available'::public.display_status, 'within_5'::public.wait_time_bucket),
    ('憲兵家', 'unknown'::public.display_status, 'no_wait'::public.wait_time_bucket),
    ('笑顔ノキラメキ', 'full'::public.display_status, 'over_20'::public.wait_time_bucket),
    ('蝉', 'stale'::public.display_status, 'no_wait'::public.wait_time_bucket),
    ('麺屋　こころ', 'limited'::public.display_status, 'between_5_10'::public.wait_time_bucket),
    ('武双家', 'available'::public.display_status, 'within_5'::public.wait_time_bucket)
) as status_seed(name, display_status, wait_time) on status_seed.name = stores.name
on conflict (store_id) do update
  set display_status = excluded.display_status,
      wait_time = excluded.wait_time,
      source = excluded.source,
      updated_at = excluded.updated_at;
