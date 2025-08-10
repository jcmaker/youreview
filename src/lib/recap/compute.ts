import type { Media, Top10Entry } from "@/types/db";

/**
 * Build recap aggregates from Top10 entries joined with media for a given year.
 */
export function buildRecap(
  entries: (Top10Entry & { media: Media })[],
  year: number
) {
  const byRank = [...entries].sort((a, b) => a.rank - b.rank);
  const byCat: Record<
    "movie" | "music" | "book",
    (Top10Entry & { media: Media })[]
  > = {
    movie: [],
    music: [],
    book: [],
  };
  byRank.forEach((e) => {
    if (e.media.category === "movie") byCat.movie.push(e);
    if (e.media.category === "music") byCat.music.push(e);
    if (e.media.category === "book") byCat.book.push(e);
  });

  // 월별 등록 수 (createdAt 기준; 없으면 0)
  const monthly = Array.from({ length: 12 }, () => 0);
  entries.forEach((e) => {
    const d = e.createdAt ? new Date(e.createdAt) : null;
    if (d && d.getFullYear() === year) monthly[d.getMonth()]++;
  });

  const top3 = {
    movie: byCat.movie.slice(0, 3),
    music: byCat.music.slice(0, 3),
    book: byCat.book.slice(0, 3),
  };

  // 공유용 이미지에 쓸 썸네일 최대 10개
  const thumbs = byRank
    .map((e) => e.media.imageUrl)
    .filter(Boolean)
    .slice(0, 10);

  return { byRank, byCat, top3, monthly, thumbs };
}
