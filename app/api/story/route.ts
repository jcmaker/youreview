export const runtime = "edge";
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ?? "";
  const title = searchParams.get("title") ?? `youreview • ${year} Top 10`;
  const category = searchParams.get("category") ?? "all";
  const imgs = searchParams.getAll("img").slice(0, 12);
  const theme = searchParams.get("theme") ?? "dark";
  const bgColor = searchParams.get("bgColor");
  const cols = Number(searchParams.get("cols") ?? "3");
  const ratio = searchParams.get("ratio") ?? "2:3";

  const W = 1080,
    H = 1920,
    gap = 16,
    pad = 48;
  const rows = Math.ceil(12 / cols);
  const [rw, rh] = ratio.split(":").map((n) => Number(n) || 1);
  const cellW = Math.floor((W - pad * 2 - (cols - 1) * gap) / cols);
  const cellH = Math.floor(cellW * (rh / rw));
  const grid = Array.from({ length: rows * cols }, (_, i) => imgs[i] ?? null);

  const bg = bgColor
    ? bgColor
    : theme === "light"
    ? "linear-gradient(180deg,#ffffff,#f3f3f3)"
    : "linear-gradient(180deg,#0f0f0f,#1b1b1b)";

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: bg,
          color: theme === "light" ? "#111" : "#fff",
          padding: pad,
          fontFamily: "ui-sans-serif, system-ui",
        },
        children: [
          {
            type: "div",
            props: {
              style: { fontSize: 44, fontWeight: 800, letterSpacing: -1 },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: { marginTop: 6, fontSize: 24, opacity: 0.85 },
              children: `${year} · ${category}`,
            },
          },
          {
            type: "div",
            props: {
              style: {
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                gap,
              },
              children: Array.from({ length: rows }, (_, r) => ({
                type: "div",
                key: `row-${r}`,
                props: {
                  style: { display: "flex", gap },
                  children: Array.from({ length: cols }, (_, c) => {
                    const i = r * cols + c;
                    const src = grid[i];
                    return {
                      type: "div",
                      key: `cell-${i}`,
                      props: {
                        style: {
                          width: cellW,
                          height: cellH,
                          borderRadius: 28,
                          overflow: "hidden",
                          background: theme === "light" ? "#e9e9e9" : "#2a2a2a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        children: src
                          ? {
                              type: "img",
                              props: {
                                src,
                                width: cellW,
                                height: cellH,
                                style: { objectFit: "cover" },
                              },
                            }
                          : {
                              type: "div",
                              props: {
                                style: { color: "#999" },
                                children: "no image",
                              },
                            },
                      },
                    };
                  }),
                },
              })),
            },
          },
          {
            type: "div",
            props: {
              style: {
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: 24, opacity: 0.9 },
                    children: "youreview.app",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: 18, opacity: 0.65 },
                    children: "#MyTop10 #youreview",
                  },
                },
              ],
            },
          },
        ],
      },
    } as unknown as React.ReactElement,
    { width: W, height: H }
  );
}
