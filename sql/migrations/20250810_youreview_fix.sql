-- youreview hardening migration (A plan)
-- Safe to run multiple times

-- 0) Extensions and utility
create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1) media: creators type, unique, indexes, trigger
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'media'
      and column_name = 'creators'
  ) then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'media'
        and column_name = 'creators'
        and udt_name <> '_text'
    ) then
      alter table public.media
        alter column creators type text[]
        using case when creators is null then null else creators::text[] end;
    end if;
  else
    alter table public.media add column creators text[];
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.media'::regclass and conname = 'media_unique_provider_id'
  ) then
    alter table public.media
      add constraint media_unique_provider_id unique (provider, provider_id);
  end if;
end$$;

create index if not exists idx_media_category on public.media (category);
create index if not exists idx_media_provider_provider_id on public.media (provider, provider_id);

drop trigger if exists _set_updated_at_media on public.media;
create trigger _set_updated_at_media
before update on public.media
for each row execute function set_updated_at();

-- 2) top10_entries: FK cascade, A-plan unique, drop category column if exists, indexes, trigger
alter table public.top10_entries
  drop constraint if exists top10_entries_media_id_fkey;
alter table public.top10_entries
  add constraint top10_entries_media_id_fkey
  foreign key (media_id) references public.media(id) on delete cascade;

-- Drop category column (A plan uses join on media for filtering)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'top10_entries' and column_name = 'category'
  ) then
    alter table public.top10_entries drop column category;
  end if;
end$$;

-- Ensure unique (user_id, year, rank)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.top10_entries'::regclass
      and conname = 'top10_unique_user_year_category_rank'
  ) then
    alter table public.top10_entries
      drop constraint top10_unique_user_year_category_rank;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.top10_entries'::regclass
      and conname = 'top10_unique_user_year_rank'
  ) then
    alter table public.top10_entries
      add constraint top10_unique_user_year_rank unique (user_id, year, rank);
  end if;
end$$;

create index if not exists idx_top10_user_year on public.top10_entries (user_id, year);
create index if not exists idx_top10_media_id on public.top10_entries (media_id);

drop trigger if exists _set_updated_at_top10 on public.top10_entries;
create trigger _set_updated_at_top10
before update on public.top10_entries
for each row execute function set_updated_at();

-- 3) profiles: trigger
drop trigger if exists _set_updated_at_profiles on public.profiles;
create trigger _set_updated_at_profiles
before update on public.profiles
for each row execute function set_updated_at();

-- 4) RLS policies
alter table if exists public.media enable row level security;
alter table if exists public.top10_entries enable row level security;
alter table if exists public.profiles enable row level security;

-- media: public read, no write (service_role bypasses RLS)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='media' and policyname='media_select_public') then
    create policy media_select_public on public.media for select using (true);
  end if;
end$$;

-- top10_entries: no public policies (service_role only)
-- profiles: optional public select
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_public') then
    create policy profiles_select_public on public.profiles for select using (true);
  end if;
end$$;

-- 5) Safe reorder RPC to avoid unique violations during swaps
create or replace function public.reorder_top10_entries(
  p_user_id uuid,
  p_year int,
  p_entries jsonb  -- array of { id: uuid, rank: int }
) returns void
language plpgsql
security definer
as $$
declare
  r record;
begin
  -- Move affected items to temp ranks to avoid collisions
  update public.top10_entries t
  set rank = rank + 100
  where t.user_id = p_user_id
    and t.year = p_year
    and t.id in (
      select (e->>'id')::uuid
      from jsonb_array_elements(p_entries) e
    );

  -- Apply final ranks
  for r in
    select (e->>'id')::uuid as id, (e->>'rank')::int as rank
    from jsonb_array_elements(p_entries) e
  loop
    update public.top10_entries
    set rank = r.rank
    where id = r.id and user_id = p_user_id and year = p_year;
  end loop;
end;
$$;


