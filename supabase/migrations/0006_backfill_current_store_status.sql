insert into public.current_store_status (store_id, display_status, wait_time, source, updated_at)
select stores.id, 'unknown', 'no_wait', 'migration', now()
from public.stores
where not exists (
  select 1
  from public.current_store_status
  where current_store_status.store_id = stores.id
);
