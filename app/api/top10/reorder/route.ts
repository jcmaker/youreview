import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireUserId();
    const body = await req.json();
    const { listId, entries } = body as {
      listId: string;
      entries: { id: string; rank: number }[];
    };
    if (!listId || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // Validate ranks 1..10, duplicates not allowed
    const ids = entries.map((e) => e.id);
    const ranks = entries.map((e) => e.rank);
    const rankSet = new Set(ranks);
    const outOfRange = ranks.some((r) => !Number.isInteger(r) || r < 1 || r > 10);
    if (outOfRange || rankSet.size !== ranks.length) {
      return NextResponse.json(
        { error: "Ranks must be integers 1..10 with no duplicates" },
        { status: 400 }
      );
    }
    const { error } = await supabaseAdmin.rpc("reorder_top10", {
      p_list_id: listId,
      p_ids: ids,
      p_ranks: ranks,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Year unknown here; client can revalidate page as needed or include year in body if desired
    // revalidatePath(`/top10/${year}`);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null) {
      const anyErr = err as {
        message?: string;
        details?: unknown;
        hint?: unknown;
        code?: unknown;
      };
      return NextResponse.json(
        {
          error: anyErr.message || "Unknown error",
          details: anyErr.details ?? null,
          hint: anyErr.hint ?? null,
          code: anyErr.code ?? null,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(err ?? "Unknown error") },
      { status: 500 }
    );
  }
}
