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
  if (!error && data) return data as string; // uuid

  // Fallback when RPC is not deployed (PGRST202) or returns no data
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("top10_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("category", category)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("top10_lists")
    .upsert(
      { user_id: userId, year, category },
      { onConflict: "user_id,year,category" }
    )
    .select("id")
    .single();
  if (insErr) throw insErr;
  return inserted.id as string;
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
