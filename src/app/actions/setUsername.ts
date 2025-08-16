"use server";

import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { normalizeUsername, validateUsername } from "@/lib/profile/username";

export async function setUsername(input: { username: string }) {
  const userId = await requireUserId();
  const normalized = normalizeUsername(input.username);
  const v = validateUsername(normalized);
  if (!v.ok) throw new Error(v.reason || "invalid username");

  // Optional pre-check (unique) — DB unique index will enforce final guarantee
  const { data: exists, error: selErr } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .limit(1);
  if (selErr) throw selErr;
  if ((exists?.length ?? 0) > 0 && exists![0].id !== userId) {
    throw new Error("이미 사용 중인 닉네임입니다");
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, username: normalized }, { onConflict: "id" });
  if (error) throw error;
  return true;
}
