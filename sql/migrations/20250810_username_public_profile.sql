-- Username public profile support

-- 1) Add username column (nullable initially)
alter table if exists public.profiles
  add column if not exists username text;

-- 2) Unique index on lower(username) for case-insensitive uniqueness
create unique index if not exists uq_profiles_username_lower
  on public.profiles (lower(username));


