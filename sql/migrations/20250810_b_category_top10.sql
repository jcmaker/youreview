-- Per-category Top 10: add category to top10_entries and unique (user_id,year,category,rank)

-- 1) Add category column if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='top10_entries' and column_name='category'
  ) then
    alter table public.top10_entries add column category text;
  end if;
end$$;

-- 2) Backfill category from media
update public.top10_entries t
set category = m.category
from public.media m
where t.media_id = m.id and (t.category is null or t.category not in ('movie','music','book'));

-- 3) Enforce not null and check
alter table public.top10_entries alter column category set not null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conrelid='public.top10_entries'::regclass and conname='top10_entries_category_check'
  ) then
    alter table public.top10_entries add constraint top10_entries_category_check check (category in ('movie','music','book'));
  end if;
end$$;

-- 4) Replace unique with per-category
do $$
begin
  if exists (
    select 1 from pg_constraint where conrelid='public.top10_entries'::regclass and conname='top10_unique_user_year_rank'
  ) then
    alter table public.top10_entries drop constraint top10_unique_user_year_rank;
  end if;
  if not exists (
    select 1 from pg_constraint where conrelid='public.top10_entries'::regclass and conname='top10_unique_user_year_category_rank'
  ) then
    alter table public.top10_entries add constraint top10_unique_user_year_category_rank unique (user_id, year, category, rank);
  end if;
end$$;

-- 5) Index for lookups
create index if not exists idx_top10_user_year_category on public.top10_entries (user_id, year, category);

-- 6) Trigger to keep category synced from media on change
create or replace function top10_set_category_from_media()
returns trigger as $$
declare
  mcat text;
begin
  if new.media_id is null then
    return new;
  end if;
  select category into mcat from public.media where id = new.media_id;
  if mcat is null then
    raise exception 'media % not found', new.media_id;
  end if;
  new.category := mcat;
  return new;
end;
$$ language plpgsql;

drop trigger if exists _top10_set_category on public.top10_entries;
create trigger _top10_set_category
before insert or update of media_id on public.top10_entries
for each row execute function top10_set_category_from_media();


