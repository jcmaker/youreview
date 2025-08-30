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
  // add_top10_item RPC 함수를 사용하여 더 안전한 랭킹 할당
  const { data, error } = await supabaseAdmin.rpc("add_top10_item", {
    p_list_id: params.listId,
    p_media_id: params.mediaId,
    p_user_note: params.userNote ?? null,
    p_user_link: params.userLink ?? null,
  });

  if (error) throw error;

  // 새로 생성된 항목의 정보를 가져오기
  const { data: item, error: itemError } = await supabaseAdmin
    .from("top10_items")
    .select("*")
    .eq("id", data)
    .single();

  if (itemError) throw itemError;

  return item;
}
