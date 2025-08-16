import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await requireUserId();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ username: data?.username ?? null });
  } catch {
    return NextResponse.json({ username: null });
  }
}


