"use server";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth/user";
import { revalidatePath } from "next/cache";
import type { Category, Provider } from "@/types/media";
import { upsertMediaByProvider } from "@/lib/db/media";
import { getOrCreateListId } from "@/lib/db/lists";
import { insertItemAutoRank } from "@/lib/db/items";

type SavePickedInput = {
  category: Category;
  provider: Provider;
  providerId: string;
  title: string;
  creators?: string[];
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  releaseDate?: string;
  year?: number;
  rank?: number | null; // ignored: server assigns empty slot automatically
  userNote?: string;
  userLink?: string;
  extra?: Record<string, unknown>;
};

/** 사용자가 선택한 검색 결과를 media/top10으로 저장 */
export async function savePickedItem(input: SavePickedInput) {
  const userId = await requireUserId();
  const year = input.year ?? new Date().getFullYear();

  const media = await upsertMediaByProvider({
    category: input.category,
    provider: input.provider,
    providerId: input.providerId,
    title: input.title,
    creators: input.creators,
    description: input.description,
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    releaseDate: input.releaseDate,
    extra: input.extra ?? {},
  });

  const listId = await getOrCreateListId(userId, year, input.category);
  const item = await insertItemAutoRank({
    listId,
    mediaId: media.id,
    userNote: input.userNote ?? null,
    userLink: input.userLink ?? null,
  });

  revalidatePath(`/create/${input.category}`);
  return {
    ok: true,
    entryId: item.id,
    rank: item.rank,
    year,
    mediaId: media.id,
  };
}
