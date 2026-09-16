create or replace function public.admin_delete_store(
  p_store_id uuid
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

  delete from public.stores
  where id = p_store_id;

  if not found then
    raise exception 'Store not found';
  end if;
end;
$$;

revoke all on function public.admin_delete_store(uuid) from public;
grant execute on function public.admin_delete_store(uuid) to authenticated;
