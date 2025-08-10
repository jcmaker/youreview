-- Ensure each user has a profile row; add helper upsert RPC

create or replace function public.ensure_profile(p_user_id uuid, p_display_name text default null)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (p_user_id, p_display_name)
  on conflict (id) do update set display_name = coalesce(excluded.display_name, public.profiles.display_name);
end;
$$;

grant execute on function public.ensure_profile(uuid, text) to anon, authenticated, service_role;


