import { NextRequest, NextResponse } from "next/server";
import { searchTMDBMovies } from "@/lib/providers/tmdb";
import { getCache, setCache } from "@/lib/http/cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    const token = process.env.TMDB_TOKEN;
    if (!token)
      return NextResponse.json(
        { error: "Missing TMDB_TOKEN" },
        { status: 500 }
      );

    const key = `tmdb:${q}`;
    const cached = getCache(key);
    if (cached) return NextResponse.json(cached);

    const items = await searchTMDBMovies(q);
    setCache(key, items, 60_000);
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "TMDB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
