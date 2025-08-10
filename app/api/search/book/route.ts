import { NextRequest, NextResponse } from "next/server";
import { searchNaverBooks } from "@/lib/providers/naverBooks";
import { searchGoogleBooks } from "@/lib/providers/googleBooks";
import { getCache, setCache } from "@/lib/http/cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const provider = req.nextUrl.searchParams.get("provider") || "naverBooks";
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    if (provider === "naverBooks") {
      if (!process.env.NAVER_ID || !process.env.NAVER_SECRET) {
        return NextResponse.json(
          { error: "Missing NAVER_ID or NAVER_SECRET" },
          { status: 500 }
        );
      }
    }
    if (provider === "googleBooks") {
      if (!process.env.GOOGLE_BOOKS_KEY) {
        return NextResponse.json(
          { error: "Missing GOOGLE_BOOKS_KEY" },
          { status: 500 }
        );
      }
    }

    const key = `book:${provider}:${q}`;
    const cached = getCache(key);
    if (cached) return NextResponse.json(cached);

    const items =
      provider === "googleBooks"
        ? await searchGoogleBooks(q)
        : await searchNaverBooks(q);
    setCache(key, items, 60_000);
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Book search error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
