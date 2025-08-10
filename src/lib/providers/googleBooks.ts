import { fetchWithTimeout } from "@/lib/http/fetcher";
import type { UnifiedResult } from "@/types/media";

interface GBImageLinks {
  thumbnail?: string;
  smallThumbnail?: string;
}
interface GBIndustryId {
  type?: string;
  identifier?: string;
}
interface GBVolumeInfo {
  title?: string;
  description?: string;
  authors?: string[];
  imageLinks?: GBImageLinks;
  infoLink?: string;
  publisher?: string;
  pageCount?: number;
  publishedDate?: string; // YYYY or YYYY-MM or YYYY-MM-DD
  industryIdentifiers?: GBIndustryId[];
}
interface GBItem {
  id: string;
  volumeInfo?: GBVolumeInfo;
}
interface GBResponse {
  items?: GBItem[];
}

export async function searchGoogleBooks(q: string): Promise<UnifiedResult[]> {
  const key = process.env.GOOGLE_BOOKS_KEY;
  if (!key) throw new Error("Missing GOOGLE_BOOKS_KEY");

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    q
  )}&maxResults=12&printType=books&key=${key}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`);
  const json: GBResponse = await res.json();

  return (json.items ?? []).map((it) => {
    const v: GBVolumeInfo = it.volumeInfo ?? {};
    let img: string | undefined =
      v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail;
    if (img?.startsWith("http:")) img = img.replace(/^http:/, "https:");
    let date: string | undefined = v.publishedDate; // YYYY or YYYY-MM or YYYY-MM-DD
    if (typeof date === "string" && date.length === 4) date = `${date}-01-01`;
    return {
      provider: "googleBooks",
      providerId: it.id,
      title: v.title ?? "Untitled",
      creators: v.authors ?? undefined,
      description: v.description || undefined,
      imageUrl: img,
      linkUrl: v.infoLink,
      releaseDate: date || undefined,
      extra: {
        publisher: v.publisher,
        pageCount: v.pageCount,
        industryIdentifiers: v.industryIdentifiers,
      },
    } as UnifiedResult;
  });
}
