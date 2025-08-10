import { fetchWithTimeout } from "@/lib/http/fetcher";
import type { UnifiedResult } from "@/types/media";

interface YouTubeItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

interface YouTubeResponse {
  items?: YouTubeItem[];
}

export async function searchYouTube(q: string): Promise<UnifiedResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY");

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(
    q
  )}&key=${key}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const json: YouTubeResponse = await res.json();

  return (json.items ?? []).map((it) => {
    const vid = it.id?.videoId;
    const sn = it.snippet ?? {};
    const th = sn.thumbnails ?? {};
    const img = th.high?.url || th.medium?.url || th.default?.url;
    return {
      provider: "youtube",
      providerId: String(vid),
      title: sn.title ?? "Untitled",
      creators: sn.channelTitle ? [sn.channelTitle] : undefined,
      description: sn.description || undefined,
      imageUrl: img,
      linkUrl: vid ? `https://www.youtube.com/watch?v=${vid}` : undefined,
      releaseDate: sn.publishedAt ? sn.publishedAt.slice(0, 10) : undefined,
      extra: { channelId: sn.channelId },
    } as UnifiedResult;
  });
}
