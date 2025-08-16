"use server";

import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

export async function deleteItem(input: { itemId: string }) {
  const userId = await requireUserId();
  const { data: item, error: e1 } = await supabaseAdmin
    .from("top10_items")
    .select("id, list_id")
    .eq("id", input.itemId)
    .maybeSingle();
  if (e1) throw e1;
  if (!item) throw new Error("item not found");

  const { data: list, error: e2 } = await supabaseAdmin
    .from("top10_lists")
    .select("user_id, year")
    .eq("id", item.list_id)
    .maybeSingle();
  if (e2) throw e2;
  if (!list || list.user_id !== userId) throw new Error("forbidden");

  const { error: e3 } = await supabaseAdmin
    .from("top10_items")
    .delete()
    .eq("id", input.itemId);
  if (e3) throw e3;

  revalidatePath(`/top10/${list.year}`);
  return { ok: true };
}


