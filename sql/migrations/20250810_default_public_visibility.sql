-- Set default visibility to public for new top10_lists
-- This migration ensures that when new lists are created, they are public by default

-- 1) Update the get_or_create_top10_list function to set default visibility to public
create or replace function public.get_or_create_top10_list(
  p_user_id text, p_year int, p_category text
) returns uuid
language plpgsql
as $$
declare
  v_list_id uuid;
begin
  select id into v_list_id
  from public.top10_lists
  where user_id = p_user_id and year = p_year and category = p_category;

  if v_list_id is null then
    insert into public.top10_lists(user_id, year, category, visibility)
    values (p_user_id, p_year, p_category, 'public')
    returning id into v_list_id;
  end if;

  return v_list_id;
end;
$$;

-- 2) Set existing lists with null visibility to public
update public.top10_lists
set visibility = 'public'
where visibility is null;

-- 3) Ensure visibility column has a default value for future inserts
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'top10_lists'
      and column_name = 'visibility'
  ) then
    alter table public.top10_lists 
    alter column visibility set default 'public';
  end if;
end$$;
