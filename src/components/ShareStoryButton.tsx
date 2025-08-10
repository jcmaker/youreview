"use client";

type Props = {
  year: number;
  category: "all" | "movie" | "music" | "book";
  images: string[];
  title?: string;
  theme?: "dark" | "light";
  bgColor?: string;
  cols?: number;
  ratio?: string;
};

export default function ShareStoryButton({
  year,
  category,
  images,
  title,
  theme,
  bgColor,
  cols,
  ratio,
}: Props) {
  async function onShare() {
    try {
      const url = new URL("/api/story", location.origin);
      url.searchParams.set("year", String(year));
      url.searchParams.set("category", category);
      url.searchParams.set("title", title ?? `youreview • ${year} Top 10`);
      if (theme) url.searchParams.set("theme", theme);
      if (bgColor) url.searchParams.set("bgColor", bgColor);
      if (cols) url.searchParams.set("cols", String(cols));
      if (ratio) url.searchParams.set("ratio", ratio);
      images.slice(0, 12).forEach((i) => url.searchParams.append("img", i));

      const res = await fetch(url.toString(), { cache: "no-store" });
      const blob = await res.blob();
      const file = new File([blob], `youreview_${year}_${category}.png`, {
        type: "image/png",
      });

      const navAny = navigator as Navigator & {
        canShare?: (data?: unknown) => boolean;
        share?: (data?: unknown) => Promise<void>;
      };

      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share?.({
          files: [file],
          title: title ?? "youreview",
          text: `${year} My Top 10 — ${category === "all" ? "All" : category}`,
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
        // optional toast/alert omitted
      }
    } catch (e) {
      console.error(e);
      alert("공유 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <button onClick={onShare} className="px-3 py-2 rounded bg-black text-white">
      인스타 스토리로 공유
    </button>
  );
}
