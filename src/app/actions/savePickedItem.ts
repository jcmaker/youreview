"use server";

import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { getOrCreateListId } from "@/lib/db/lists";
import { insertItemAutoRank } from "@/lib/db/items";
import { revalidatePath } from "next/cache";

type Category = "movie" | "music" | "book";
type Provider = "tmdb" | "youtube" | "spotify" | "naverBooks" | "googleBooks";

export const runtime = "nodejs";

export async function savePickedItem(input: {
  year?: number;
  category: Category;
  provider: Provider;
  providerId: string;
  title: string;
  creators?: string[];
  description?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  releaseDate?: string | null;
  userNote?: string | null;
  userLink?: string | null;
  extra?: Record<string, any>;
}) {
  const userId = await requireUserId();
  const year = input.year ?? new Date().getFullYear();

  const { data: media, error: mErr } = await supabaseAdmin
    .from("media")
    .upsert(
      {
        category: input.category,
        provider: input.provider,
        provider_id: input.providerId,
        title: input.title,
        creators: input.creators ?? null,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        link_url: input.linkUrl ?? null,
        release_date: input.releaseDate ?? null,
        extra: input.extra ?? {},
      },
      { onConflict: "provider,provider_id" }
    )
    .select()
    .single();
  if (mErr) throw mErr;

  const listId = await getOrCreateListId(userId, year, input.category);

  const item = await insertItemAutoRank({
    listId,
    mediaId: media.id,
    userNote: input.userNote,
    userLink: input.userLink,
  });

  revalidatePath(`/top10/${year}`);
  return { ok: true, year, listId, itemId: item.id, rank: item.rank };
}
