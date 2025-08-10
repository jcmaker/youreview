-- 1) 제약이 DEFERRABLE인지 보정
do $$
begin
  alter table public.top10_items
    drop constraint if exists top10_items_list_id_rank_key;
exception when undefined_object then
  null;
end$$;

alter table public.top10_items
  add constraint top10_items_list_id_rank_key
  unique (list_id, rank) deferrable initially immediate;

-- 2) get_or_create_top10_list(user_id, year, category)
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
    insert into public.top10_lists(user_id, year, category)
    values (p_user_id, p_year, p_category)
    returning id into v_list_id;
  end if;

  return v_list_id;
end;
$$;

-- 3) reorder_top10(list_id, ids[], ranks[])
create or replace function public.reorder_top10(
  p_list_id uuid, p_ids uuid[], p_ranks int[]
) returns void
language plpgsql
as $$
declare
  n int := array_length(p_ids, 1);
begin
  if n is distinct from array_length(p_ranks, 1) then
    raise exception 'ids/ranks length mismatch';
  end if;

  set constraints top10_items_list_id_rank_key deferred;

  -- 대상만 임시 rank=0
  update public.top10_items
    set rank = 0
  where list_id = p_list_id
    and id = any(p_ids);

  -- 새 rank 적용
  for i in 1..n loop
    update public.top10_items
      set rank = p_ranks[i]
    where id = p_ids[i] and list_id = p_list_id;
  end loop;
end;
$$;

