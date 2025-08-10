export type Provider =
  | "tmdb"
  | "youtube"
  | "spotify"
  | "naverBooks"
  | "googleBooks";
export type Category = "movie" | "music" | "book";

export type UnifiedResult = {
  provider: Provider;
  providerId: string;
  title: string;
  creators?: string[];
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  releaseDate?: string; // ISO-8601 (YYYY-MM-DD or YYYY)
  extra?: Record<string, unknown>;
};
