export const runtime = "edge";

import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").toLowerCase();
  const year = Number(searchParams.get("year") || new Date().getFullYear());

  let displayTitle = `${year} Top 10`;
  let imgs: string[] = [];
  try {
    if (username) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, username")
        .ilike("username", username)
        .maybeSingle();
      if (profile) {
        displayTitle = `${
          profile.display_name || profile.username
        } — ${year} Top 10`;
        const { data: lists } = await supabaseAdmin
          .from("top10_lists")
          .select("id")
          .eq("user_id", profile.id)
          .eq("year", year)
          .eq("visibility", "public")
          .gt("item_count", 0);
        const listIds = (lists ?? []).map((l) => l.id);
        if (listIds.length > 0) {
          const { data: items } = await supabaseAdmin
            .from("top10_items")
            .select("media:media_id ( image_url )")
            .in("list_id", listIds)
            .order("rank", { ascending: true })
            .limit(10);
          type OgItem = { media?: { image_url?: string | null } | null };
          imgs = ((items ?? []) as OgItem[])
            .map((it) => it.media?.image_url ?? null)
            .filter(Boolean)
            .slice(0, 10) as string[];
        }
      }
    }
  } catch {
    // ignore and fall back to default
  }

  const cell = 180;
  const cols = 5;
  const rows = 2;
  const width = 1200;
  const height = 630;
  const grid = Array.from({ length: rows * cols }, (_, i) => imgs[i] ?? null);

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width,
          height,
          display: "flex",
          flexDirection: "column",
          background: "white",
          padding: 40,
          fontFamily: "ui-sans-serif, system-ui",
        },
        children: [
          {
            type: "div",
            props: {
              style: { fontSize: 44, fontWeight: 800, lineHeight: 1.2 },
              children: displayTitle,
            },
          },
          {
            type: "div",
            props: {
              style: { marginTop: 10, color: "#666", fontSize: 22 },
              children: `${year} Top 10`,
            },
          },
          {
            type: "div",
            props: {
              style: {
                marginTop: 30,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
                gap: 12,
              },
              children: grid.map((src, i) => ({
                type: "div",
                key: String(i),
                props: {
                  style: {
                    width: cell,
                    height: cell,
                    background: "#f2f2f2",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e5e5",
                  },
                  children: src
                    ? {
                        type: "img",
                        props: {
                          src,
                          width: cell,
                          height: cell,
                          style: { objectFit: "cover" },
                        },
                      }
                    : {
                        type: "div",
                        props: {
                          style: { color: "#aaa", fontSize: 16 },
                          children: "no image",
                        },
                      },
                },
              })),
            },
          },
          {
            type: "div",
            props: {
              style: { marginTop: 24, color: "#999", fontSize: 18 },
              children: "youreview.app",
            },
          },
        ],
      },
    } as unknown as React.ReactElement,
    { width, height }
  );
}
