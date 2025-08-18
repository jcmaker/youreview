// No anon client usage in write paths
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { Category, Media, Provider, Top10Entry } from "@/types/db";

type CreateOrUpdateInput = {
  userId: string;
  year: number;
  rank: number; // 1..10
  mediaId: string;
  userNote?: string;
  userLink?: string;
  category?: Category; // optional: when provided, update will target this category row
};

type ReorderInput = {
  userId: string;
  year: number;
  entries: { id: string; rank: number }[];
};

interface Top10Row {
  id: string;
  user_id: string;
  year: number;
  rank: number;
  media_id: string;
  user_note: string | null;
  user_link: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToTop10(row: Top10Row): Top10Entry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    year: row.year as number,
    rank: row.rank as number,
    mediaId: row.media_id as string,
    userNote: (row.user_note as string | null) ?? null,
    userLink: (row.user_link as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

interface MediaJoinedRow {
  id: string;
  category: Category;
  provider: Provider;
  provider_id: string;
  title: string;
  creators: string[] | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  release_date: string | null;
  extra: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapRowToMedia(row: MediaJoinedRow): Media {
  return {
    id: row.id as string,
    category: row.category as Media["category"],
    provider: row.provider as Media["provider"],
    providerId: row.provider_id as string,
    title: row.title as string,
    creators: (row.creators as string[] | null) ?? null,
    description: (row.description as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    linkUrl: (row.link_url as string | null) ?? null,
    releaseDate: (row.release_date as string | null) ?? null,
    extra: (row.extra as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Insert or update an entry by (userId, year, rank).
 */
export async function createOrUpdateEntry(
  input: CreateOrUpdateInput
): Promise<Top10Entry> {
  // First try update existing row for this user/year/(category)/rank
  let upd = supabaseAdmin
    .from("top10_entries")
    .update({
      media_id: input.mediaId,
      user_note: input.userNote ?? null,
      user_link: input.userLink ?? null,
    })
    .eq("user_id", input.userId)
    .eq("year", input.year)
    .eq("rank", input.rank);
  if (input.category) {
    upd = upd.eq("category", input.category);
  }
  const { data: updated, error: upErr } = await upd.select("*").maybeSingle();
  if (upErr) throw upErr;
  if (updated) {
    return mapRowToTop10(updated as unknown as Top10Row);
  }

  // Insert new row; category will be synced by DB trigger from media.category
  const { data, error } = await supabaseAdmin
    .from("top10_entries")
    .insert({
      user_id: input.userId,
      year: input.year,
      rank: input.rank,
      media_id: input.mediaId,
      user_note: input.userNote ?? null,
      user_link: input.userLink ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Insert failed: no data returned");
  return mapRowToTop10(data);
}

/**
 * List entries for a user in a year with media joined. Ordered by rank asc.
 */
export async function listEntriesByYear(
  userId: string,
  year: number
): Promise<(Top10Entry & { media: Media })[]> {
  const { data, error } = await supabaseAdmin
    .from("top10_entries")
    .select("*, media:media_id(*)")
    .eq("user_id", userId)
    .eq("year", year)
    .order("rank", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<
    Top10Row & { media: MediaJoinedRow }
  >;
  return rows.map((row) => {
    const top10 = mapRowToTop10(row);
    const mediaRow = row.media;
    const media = mapRowToMedia(mediaRow);
    return { ...top10, media };
  });
}

/**
 * Optimistically reorder multiple entries' ranks for a given user and year.
 */
export async function reorderEntries(input: ReorderInput): Promise<void> {
  await Promise.all(
    input.entries.map(({ id, rank }) =>
      supabaseAdmin
        .from("top10_entries")
        .update({ rank })
        .eq("id", id)
        .eq("user_id", input.userId)
        .eq("year", input.year)
    )
  ).then((results) => {
    const firstError = results.find((r) => "error" in r && r.error);
    if (firstError && "error" in firstError && firstError.error) {
      // Re-throw the first encountered error
      throw firstError.error;
    }
  });
}

/**
 * Delete an entry by id.
 */
export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("top10_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/**
 * Get count of entries for a user in a specific year and category.
 */
export async function getEntryCountByCategory(
  userId: string,
  year: number,
  category: Category
): Promise<number> {
  // Use the same approach as dashboard: get list ID and then get items
  const { data: listData, error: listError } = await supabaseAdmin
    .from("top10_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("category", category)
    .maybeSingle();

  if (listError) throw listError;

  // If no list exists, return 0
  if (!listData?.id) {
    return 0;
  }

  // Get all items in this list and return the length
  const { data: items, error } = await supabaseAdmin
    .from("top10_items")
    .select("id")
    .eq("list_id", listData.id);

  if (error) throw error;
  return items?.length ?? 0;
}

export type {
  CreateOrUpdateInput as CreateOrUpdateEntryInput,
  ReorderInput as ReorderEntriesInput,
};
