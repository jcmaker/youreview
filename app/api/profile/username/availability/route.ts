export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { normalizeUsername, validateUsername } from "@/lib/profile/username";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const u = normalizeUsername(q);
  const v = validateUsername(u);
  if (!v.ok)
    return NextResponse.json(
      { available: false, reason: v.reason },
      { status: 200 }
    );
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", u)
    .limit(1);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { available: (data?.length ?? 0) === 0 },
    { status: 200 }
  );
}
