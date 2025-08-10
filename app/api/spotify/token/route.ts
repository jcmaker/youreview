export const runtime = "nodejs";
import { NextResponse } from "next/server";

let cached: { token: string; exp: number } | null = null;

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret)
    return NextResponse.json({ error: "Missing Spotify env" }, { status: 500 });

  const now = Date.now();
  if (cached && cached.exp - 5000 > now) {
    return NextResponse.json({
      access_token: cached.token,
      expires_in: Math.floor((cached.exp - now) / 1000),
    });
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString(
        "base64"
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "youreview-bot",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok)
    return NextResponse.json(
      { error: `Spotify token failed: ${res.status}` },
      { status: 500 }
    );
  const json = await res.json();
  cached = {
    token: json.access_token,
    exp: Date.now() + json.expires_in * 1000,
  };
  return NextResponse.json({
    access_token: json.access_token,
    expires_in: json.expires_in,
  });
}
