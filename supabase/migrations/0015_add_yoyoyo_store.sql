with upserted_store as (
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
    'ラム白湯専門店　羊羊羊',
    'ラム白湯ラーメンを楽しめる関大前エリアの飲食店です。',
    'ラム白湯ラーメン',
    '800_1200',
    '大阪府吹田市千里山東1-7-22',
    34.77295,
    135.50623,
    4,
    '11:00-15:00 / 17:00-21:30',
    '未設定',
    false,
    false
  )
  on conflict do nothing
  returning id
),
target_store as (
  select id from upserted_store
  union
  select id from public.stores where name = 'ラム白湯専門店　羊羊羊'
)
insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
select target_store.id, 'unknown'::public.display_status, 'no_wait'::public.wait_time_bucket, 'initial_catalog', now()
from target_store
on conflict (store_id) do nothing;
