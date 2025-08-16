"use server";

import { requireUserId } from "@/lib/auth/user";
import { getOrCreateListId } from "@/lib/db/lists";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

type Category = "movie" | "music" | "book";

export async function setListVisibility(input: {
  year?: number;
  category: Category;
  visible: boolean;
}) {
  const userId = await requireUserId();
  const year = input.year ?? new Date().getFullYear();

  const listId = await getOrCreateListId(userId, year, input.category);

  const { error } = await supabaseAdmin
    .from("top10_lists")
    .update({ visibility: input.visible ? "public" : "private" })
    .eq("id", listId);
  if (error) throw error;

  revalidatePath(`/top10/${year}`);
  return { ok: true, year, listId, visibility: input.visible ? "public" : "private" };
}


