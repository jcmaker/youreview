import { fetchWithTimeout } from "@/lib/http/fetcher";
import type { UnifiedResult } from "@/types/media";

interface SpotifyArtist {
  name?: string;
}
interface SpotifyAlbum {
  name?: string;
  release_date?: string;
  images?: Array<{ url?: string }>;
}
interface SpotifyTrack {
  id: string;
  name: string;
  artists?: SpotifyArtist[];
  preview_url?: string | null;
  external_urls?: { spotify?: string };
  album?: SpotifyAlbum;
}
interface SpotifyResponse {
  tracks?: { items?: SpotifyTrack[] };
}

export async function searchSpotifyTracks(
  q: string,
  accessToken: string
): Promise<UnifiedResult[]> {
  if (!accessToken) throw new Error("Missing Spotify access token");
  const url = `https://api.spotify.com/v1/search?type=track&limit=12&q=${encodeURIComponent(
    q
  )}`;
  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`);
  const json: SpotifyResponse = await res.json();

  return (json.tracks?.items ?? []).map((t) => ({
    provider: "spotify",
    providerId: t.id,
    title: t.name,
    creators: (t.artists ?? []).map((a) => a.name || "").filter(Boolean),
    description: undefined,
    imageUrl: t.album?.images?.[0]?.url,
    linkUrl: t.external_urls?.spotify,
    releaseDate: t.album?.release_date || undefined,
    extra: { album: t.album?.name, preview_url: t.preview_url },
  }));
}
