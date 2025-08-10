export const runtime = "edge";

import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ?? "";
  const title = searchParams.get("title") ?? `youreview • ${year} Top 10`;
  const imgs = searchParams.getAll("img").slice(0, 10);

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
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: { marginTop: 10, color: "#666", fontSize: 22 },
              children: `${year} Recap`,
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
