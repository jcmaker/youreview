-- Make unique constraint DEFERRABLE and add category-aware reorder RPC

do $$
begin
  if exists (
    select 1 from pg_constraint where conrelid='public.top10_entries'::regclass and conname='uq_top10_user_year_category_rank'
  ) then
    alter table public.top10_entries drop constraint uq_top10_user_year_category_rank;
  end if;
exception when undefined_object then
  -- ignore
end$$;

do $$
begin
  if exists (
    select 1 from pg_constraint where conrelid='public.top10_entries'::regclass and conname='top10_unique_user_year_category_rank'
  ) then
    alter table public.top10_entries drop constraint top10_unique_user_year_category_rank;
  end if;
exception when undefined_object then
end$$;

alter table public.top10_entries
  add constraint uq_top10_user_year_category_rank
  unique (user_id, year, category, rank) deferrable initially immediate;

-- Replace RPC with category-aware version using deferrable unique
drop function if exists public.reorder_top10_entries(uuid, int, jsonb);

create or replace function public.reorder_top10(
  p_user_id uuid,
  p_year int,
  p_category text,
  p_ids uuid[],
  p_ranks int[]
) returns void
language plpgsql
security definer
as $$
declare
  n int := array_length(p_ids, 1);
begin
  if n is distinct from array_length(p_ranks, 1) then
    raise exception 'ids/ranks length mismatch';
  end if;

  set constraints uq_top10_user_year_category_rank deferred;

  -- Directly apply final ranks within a single transaction
  for i in 1..n loop
    update public.top10_entries
    set rank = p_ranks[i]
    where id = p_ids[i]
      and user_id = p_user_id
      and year = p_year
      and category = p_category;
  end loop;
end;
$$;

grant execute on function public.reorder_top10(uuid, int, text, uuid[], int[]) to anon, authenticated, service_role;


