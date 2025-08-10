-- Initialize extensions needed for UUID generation
create extension if not exists pgcrypto;

-- Trigger function to automatically update updated_at timestamp
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1) media
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('movie','music','book')),
  provider text not null check (provider in ('tmdb','youtube','spotify','naverBooks','googleBooks')),
  provider_id text not null,
  title text not null,
  creators text[],
  description text,
  image_url text,
  link_url text,
  release_date date,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_unique_provider_id unique (provider, provider_id)
);

create index if not exists idx_media_category on public.media (category);
create index if not exists idx_media_provider_provider_id on public.media (provider, provider_id);

drop trigger if exists _set_updated_at on public.media;
create trigger _set_updated_at
before update on public.media
for each row execute function set_updated_at();

-- 2) top10_entries
create table if not exists public.top10_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year int not null,
  rank int not null check (rank between 1 and 10),
  media_id uuid references public.media(id) on delete cascade,
  user_note text,
  user_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint top10_unique_user_year_rank unique (user_id, year, rank)
);

create index if not exists idx_top10_user_year on public.top10_entries (user_id, year);
create index if not exists idx_top10_media_id on public.top10_entries (media_id);

drop trigger if exists _set_updated_at on public.top10_entries;
create trigger _set_updated_at
before update on public.top10_entries
for each row execute function set_updated_at();

-- 3) profiles
create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists _set_updated_at on public.profiles;
create trigger _set_updated_at
before update on public.profiles
for each row execute function set_updated_at();


