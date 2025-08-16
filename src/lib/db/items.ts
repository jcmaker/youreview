import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export type Item = {
  id: string;
  list_id: string;
  media_id: string;
  rank: number;
  user_note: string | null;
  user_link: string | null;
  created_at: string;
  updated_at: string;
  media: {
    id: string;
    title: string;
    image_url: string | null;
    creators: string[] | null;
    category: "movie" | "music" | "book";
    link_url: string | null;
  };
};

export async function listItemsByListId(listId: string) {
  const { data, error } = await supabaseAdmin
    .from("top10_items")
    .select(
      `
      id, list_id, media_id, rank, user_note, user_link, created_at, updated_at,
      media:media_id ( id, title, image_url, creators, category, link_url )
    `
    )
    .eq("list_id", listId)
    .order("rank", { ascending: true });
  if (error) throw error;
  type Raw = {
    id: string;
    list_id: string;
    media_id: string;
    rank: number;
    user_note: string | null;
    user_link: string | null;
    created_at: string;
    updated_at: string;
    media?: {
      id?: string;
      title?: string | null;
      image_url?: string | null;
      creators?: string[] | null;
      category?: "movie" | "music" | "book";
      link_url?: string | null;
    } | null;
  };
  const rows = (data ?? []) as Raw[];
  const mapped: Item[] = rows.map((r) => ({
    id: r.id,
    list_id: r.list_id,
    media_id: r.media_id,
    rank: r.rank,
    user_note: r.user_note,
    user_link: r.user_link,
    created_at: r.created_at,
    updated_at: r.updated_at,
    media: {
      id: (r.media?.id ?? "") as string,
      title: (r.media?.title ?? "") as string,
      image_url: (r.media?.image_url ?? null) as string | null,
      creators: (r.media?.creators ?? null) as string[] | null,
      category: (r.media?.category ?? "movie") as "movie" | "music" | "book",
      link_url: (r.media?.link_url ?? null) as string | null,
    },
  }));
  return mapped;
}

export async function insertItemAutoRank(params: {
  listId: string;
  mediaId: string;
  userNote?: string | null;
  userLink?: string | null;
}) {
  const { data: existing, error: e1 } = await supabaseAdmin
    .from("top10_items")
    .select("rank")
    .eq("list_id", params.listId);
  if (e1) throw e1;
  const ranks = new Set((existing ?? []).map((r) => r.rank as number));
  // Find the first empty rank in 1..10
  let nextRank = 0;
  for (let i = 1; i <= 10; i += 1) {
    if (!ranks.has(i)) {
      nextRank = i;
      break;
    }
  }
  if (nextRank === 0) {
    throw new Error("해당 리스트가 이미 10개로 가득 찼습니다.");
  }

  const { data, error } = await supabaseAdmin
    .from("top10_items")
    .insert({
      list_id: params.listId,
      media_id: params.mediaId,
      rank: nextRank,
      user_note: params.userNote ?? null,
      user_link: params.userLink ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
