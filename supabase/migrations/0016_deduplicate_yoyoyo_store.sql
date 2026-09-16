do $$
declare
  keeper_store_id uuid;
  duplicate_store record;
begin
  select id
  into keeper_store_id
  from public.stores
  where replace(replace(name, ' ', ''), '　', '') = 'ラム白湯専門店羊羊羊'
  order by created_at asc, id asc
  limit 1;

  if keeper_store_id is null then
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
      'ラム白湯専門店 羊羊羊',
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
    returning id into keeper_store_id;
  end if;

  update public.stores
  set name = 'ラム白湯専門店 羊羊羊',
      description = 'ラム白湯ラーメンを楽しめる関大前エリアの飲食店です。',
      genre = 'ラム白湯ラーメン',
      price_band = '800_1200',
      address = '大阪府吹田市千里山東1-7-22',
      lat = 34.77295,
      lng = 135.50623,
      walk_minutes = 4,
      hours = '11:00-15:00 / 17:00-21:30',
      closed = '未設定',
      accepts_takeout = false,
      has_student_discount = false,
      updated_at = now()
  where id = keeper_store_id;

  for duplicate_store in
    select id
    from public.stores
    where replace(replace(name, ' ', ''), '　', '') = 'ラム白湯専門店羊羊羊'
      and id <> keeper_store_id
  loop
    update public.store_status_updates
    set store_id = keeper_store_id
    where store_id = duplicate_store.id;

    update public.visit_records
    set store_id = keeper_store_id
    where store_id = duplicate_store.id;

    update public.crowd_reports
    set store_id = keeper_store_id
    where store_id = duplicate_store.id;

    insert into public.store_admins (store_id, user_id, created_at)
    select keeper_store_id, user_id, created_at
    from public.store_admins
    where store_id = duplicate_store.id
    on conflict (store_id, user_id) do nothing;

    delete from public.store_admins
    where store_id = duplicate_store.id;

    insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until)
    select keeper_store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until
    from public.current_store_status
    where store_id = duplicate_store.id
    order by updated_at desc
    limit 1
    on conflict (store_id) do nothing;

    delete from public.stores
    where id = duplicate_store.id;
  end loop;

  insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
  values (keeper_store_id, 'unknown', 'no_wait', 'initial_catalog', now())
  on conflict (store_id) do nothing;
end;
$$;

create unique index if not exists stores_yoyoyo_normalized_name_unique
  on public.stores ((replace(replace(name, ' ', ''), '　', '')))
  where replace(replace(name, ' ', ''), '　', '') = 'ラム白湯専門店羊羊羊';
