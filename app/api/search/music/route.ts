import { NextRequest, NextResponse } from "next/server";
import { searchYouTube } from "@/lib/providers/youtube";
import { searchSpotifyTracks } from "@/lib/providers/spotify";
import { getCache, setCache } from "@/lib/http/cache";

async function getSpotifyToken(req: NextRequest): Promise<string> {
  const origin = req.nextUrl.origin;
  const res = await fetch(`${origin}/api/spotify/token`, {
    cache: "no-store",
    headers: { "User-Agent": "youreview-bot" },
  });
  if (!res.ok) throw new Error("Spotify token fetch failed");
  const json = await res.json();
  return json.access_token as string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const provider = req.nextUrl.searchParams.get("provider") || "youtube";
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  try {
    if (provider === "youtube") {
      if (!process.env.YOUTUBE_API_KEY)
        return NextResponse.json(
          { error: "Missing YOUTUBE_API_KEY" },
          { status: 500 }
        );
    }
    if (provider === "spotify") {
      if (
        !process.env.SPOTIFY_CLIENT_ID ||
        !process.env.SPOTIFY_CLIENT_SECRET
      ) {
        return NextResponse.json(
          { error: "Missing Spotify env" },
          { status: 500 }
        );
      }
    }

    const key = `music:${provider}:${q}`;
    const cached = getCache(key);
    if (cached) return NextResponse.json(cached);

    let items;
    if (provider === "spotify") {
      const token = await getSpotifyToken(req);
      items = await searchSpotifyTracks(q, token);
    } else {
      items = await searchYouTube(q);
    }
    setCache(key, items, 60_000);
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Music search error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
