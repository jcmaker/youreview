import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export async function getOrCreateListId(
  userId: string,
  year: number,
  category: "movie" | "music" | "book"
) {
  const { data, error } = await supabaseAdmin.rpc("get_or_create_top10_list", {
    p_user_id: userId,
    p_year: year,
    p_category: category,
  });

  if (error) throw error;
  if (!data) throw new Error("Failed to create or get list");

  return data as string; // uuid
}

export async function getListId(
  userId: string,
  year: number,
  category: "movie" | "music" | "book"
) {
  const { data, error } = await supabaseAdmin
    .from("top10_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("category", category)
    .maybeSingle();
  if (error) throw error;
  return (data?.id as string) ?? null;
}
