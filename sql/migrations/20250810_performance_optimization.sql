-- Performance optimization migration for user profile pages
-- This migration adds indexes to improve query performance for category switching

-- 1) Add composite index for top10_lists lookups by user_id, year, category
create index if not exists idx_top10_lists_user_year_category 
on public.top10_lists (user_id, year, category);

-- 2) Add index for top10_lists visibility filtering
create index if not exists idx_top10_lists_visibility 
on public.top10_lists (visibility) where visibility = 'public';

-- 3) Add composite index for top10_items with list_id and rank ordering
create index if not exists idx_top10_items_list_rank 
on public.top10_items (list_id, rank);

-- 4) Add index for media lookups by category (if not exists)
create index if not exists idx_media_category_provider 
on public.media (category, provider);

-- 5) Add index for profiles username lookups (case-insensitive)
create index if not exists idx_profiles_username_lower 
on public.profiles (lower(username));

-- 6) Add index for top10_lists item_count filtering
create index if not exists idx_top10_lists_item_count 
on public.top10_lists (item_count) where item_count > 0;

-- 7) Add composite index for efficient user profile data fetching
create index if not exists idx_top10_lists_user_year_item_count 
on public.top10_lists (user_id, year, item_count) where item_count > 0;

-- 8) Add index for media_id lookups in top10_items
create index if not exists idx_top10_items_media_id 
on public.top10_items (media_id);

-- 9) Add partial index for public lists only
create index if not exists idx_top10_lists_public_only 
on public.top10_lists (user_id, year, category, visibility) 
where visibility = 'public';

-- 10) Add index for efficient category-based filtering
create index if not exists idx_top10_lists_category_visibility 
on public.top10_lists (category, visibility, user_id, year);
