import { fetchWithTimeout } from "@/lib/http/fetcher";
import type { UnifiedResult } from "@/types/media";

interface NaverBookItem {
  title?: string;
  link?: string;
  image?: string;
  author?: string;
  discount?: string;
  publisher?: string;
  isbn?: string;
  description?: string;
  pubdate?: string; // YYYYMMDD
}
interface NaverBooksResponse {
  items?: NaverBookItem[];
}

export async function searchNaverBooks(q: string): Promise<UnifiedResult[]> {
  const id = process.env.NAVER_ID;
  const secret = process.env.NAVER_SECRET;
  if (!id || !secret) throw new Error("Missing NAVER_ID or NAVER_SECRET");

  const url = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(
    q
  )}&display=12`;
  const res = await fetchWithTimeout(url, {
    headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret },
  });
  if (!res.ok) throw new Error(`Naver Books search failed: ${res.status}`);
  const json: NaverBooksResponse = await res.json();

  return (json.items ?? []).map((b) => ({
    provider: "naverBooks",
    providerId: (b.isbn || b.link || b.title) ?? "unknown",
    title:
      (b.title ? b.title.replace(/<[^>]+>/g, "") : undefined) ?? "Untitled",
    creators: b.author
      ? String(b.author)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    description: b.description
      ? String(b.description).replace(/<[^>]+>/g, "")
      : undefined,
    imageUrl: b.image || undefined,
    linkUrl: b.link || undefined,
    releaseDate: b.pubdate
      ? `${b.pubdate.slice(0, 4)}-${b.pubdate.slice(4, 6)}-${b.pubdate.slice(
          6,
          8
        )}`
      : undefined,
    extra: { publisher: b.publisher, discount: b.discount, isbn: b.isbn },
  }));
}
