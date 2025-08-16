import { NextRequest, NextResponse } from "next/server";
import { searchNaverBooks } from "@/lib/providers/naverBooks";
import { searchGoogleBooks } from "@/lib/providers/googleBooks";
import { getCache, setCache } from "@/lib/http/cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const provider = req.nextUrl.searchParams.get("provider");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    // 환경 변수 확인
    const hasNaver = process.env.NAVER_ID && process.env.NAVER_SECRET;
    const hasGoogle = process.env.GOOGLE_BOOKS_KEY;

    if (!hasNaver && !hasGoogle) {
      return NextResponse.json(
        { error: "No book providers configured" },
        { status: 500 }
      );
    }

    // 특정 provider가 지정된 경우
    if (provider) {
      if (provider === "naverBooks" && !hasNaver) {
        return NextResponse.json(
          { error: "Missing NAVER_ID or NAVER_SECRET" },
          { status: 500 }
        );
      }
      if (provider === "googleBooks" && !hasGoogle) {
        return NextResponse.json(
          { error: "Missing GOOGLE_BOOKS_KEY" },
          { status: 500 }
        );
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
    }

    // provider가 지정되지 않은 경우 두 개 모두 사용
    const key = `book:combined:${q}`;
    const cached = getCache(key);
    if (cached) return NextResponse.json(cached);

    const results = await Promise.allSettled([
      hasNaver ? searchNaverBooks(q) : Promise.resolve([]),
      hasGoogle ? searchGoogleBooks(q) : Promise.resolve([]),
    ]);

    const allItems = [];

    // Naver Books 결과 추가
    if (results[0].status === "fulfilled") {
      allItems.push(...results[0].value);
    }

    // Google Books 결과 추가
    if (results[1].status === "fulfilled") {
      allItems.push(...results[1].value);
    }

    // 중복 제거 (같은 제목과 작가인 경우)
    const uniqueItems = allItems.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.title.toLowerCase() === item.title.toLowerCase() &&
            t.creators?.join(", ").toLowerCase() ===
              item.creators?.join(", ").toLowerCase()
        )
    );

    setCache(key, uniqueItems, 60_000);
    return NextResponse.json(uniqueItems);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Book search error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
