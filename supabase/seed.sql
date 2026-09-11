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
values
  ('麺処　とりとん', '関大前エリアの飲食店です。', '居酒屋', '800_1200', '大阪府吹田市千里山東', 34.773298685190646, 135.50875504614464, 4, '未設定', '未設定', false, false),
  ('つけ麺　雀', '関大前エリアの飲食店です。', 'つけ麺', '800_1200', '大阪府吹田市千里山東', 34.77360601431687, 135.50812084235423, 3, '未設定', '未設定', false, false),
  ('きりん寺', '関大前エリアの飲食店です。', '油そば', '800_1200', '大阪府吹田市千里山東', 34.77360601434054, 135.5078827963048, 3, '未設定', '未設定', false, false),
  ('ラーメン　豚福', '関大前エリアの飲食店です。', '家系ラーメン', '800_1200', '大阪府吹田市千里山東', 34.7735503836104, 135.50705801701554, 2, '未設定', '未設定', false, false),
  ('憲兵家', '関大前エリアの飲食店です。', '家系ラーメン', '800_1200', '大阪府吹田市千里山東', 34.77343339593108, 135.5060875932717, 6, '未設定', '未設定', false, false),
  ('笑顔ノキラメキ', '関大前エリアの飲食店です。', '鶏白湯ラーメン', '800_1200', '大阪府吹田市千里山東', 34.773432294310346, 135.5060185264151, 6, '未設定', '未設定', false, false),
  ('蝉', '関大前エリアの飲食店です。', '魚介豚骨ラーメン', '800_1200', '大阪府吹田市千里山東', 34.77327041674564, 135.50677486778991, 4, '未設定', '未設定', false, false),
  ('麺屋　こころ', '関大前エリアの飲食店です。', 'ラーメン', '800_1200', '大阪府吹田市千里山東', 34.77283513040589, 135.50586781314328, 7, '未設定', '未設定', false, false),
  ('武双家', '関大前エリアの飲食店です。', 'ラーメン', '800_1200', '大阪府吹田市千里山東', 34.7729585105518, 135.50586781308675, 7, '未設定', '未設定', false, false);

insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
select stores.id, status_seed.display_status, status_seed.wait_time, 'seed', now()
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
on conflict (store_id) do nothing;
