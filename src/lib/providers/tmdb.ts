import { fetchWithTimeout } from "@/lib/http/fetcher";
import type { UnifiedResult } from "@/types/media";

interface TMDBMovie {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string | null;
  vote_average?: number;
  popularity?: number;
}

interface TMDBResponse {
  results?: TMDBMovie[];
}

export async function searchTMDBMovies(q: string): Promise<UnifiedResult[]> {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error("Missing TMDB_TOKEN");

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    q
  )}&include_adult=false`;
  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
  const json: TMDBResponse = await res.json();

  return (json.results ?? []).map((m) => ({
    provider: "tmdb",
    providerId: String(m.id),
    title: m.title ?? m.original_title ?? "Untitled",
    creators: undefined,
    description: m.overview || undefined,
    imageUrl: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : undefined,
    linkUrl: `https://www.themoviedb.org/movie/${m.id}`,
    releaseDate: m.release_date || undefined,
    extra: { vote_average: m.vote_average, popularity: m.popularity },
  }));
}
