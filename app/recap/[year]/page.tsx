import Link from "next/link";
import { requireUserId } from "@/lib/auth/user";
import { listEntriesByYear } from "@/lib/db/top10";
import { buildRecap } from "@/lib/recap/compute";
import { StatCard, ThumbGrid } from "@/components/RecapSection";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = Number(year);

  return {
    title: `${yearNum}년 연말결산 - youreview`,
    description: `${yearNum}년 나만의 Top 10 연말결산을 확인하고 통계를 살펴보세요.`,
    keywords: [`${yearNum}년`, "연말결산", "Top 10", "통계", "리뷰"],
    openGraph: {
      title: `${yearNum}년 연말결산 - youreview`,
      description: `${yearNum}년 나만의 Top 10 연말결산을 확인하고 통계를 살펴보세요.`,
      type: "website",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${yearNum}년 연말결산 - youreview`,
      description: `${yearNum}년 나만의 Top 10 연말결산을 확인하고 통계를 살펴보세요.`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const userId = await requireUserId();
  const y = Number(year);
  if (Number.isNaN(y)) return <div className="p-6">Invalid year</div>;
  const currentYear = new Date().getFullYear();
  // Force to current year data only
  const effectiveYear = currentYear;

  const entries = await listEntriesByYear(userId, effectiveYear);
  const { byRank, top3, monthly, thumbs } = buildRecap(entries, effectiveYear);

  const count = byRank.length;
  const cMovie = top3.movie.length ? top3.movie[0].media.title : "-";
  const cMusic = top3.music.length ? top3.music[0].media.title : "-";
  const cBook = top3.book.length ? top3.book[0].media.title : "-";

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const ogURL = (() => {
    const u = new URL("/api/og", base);
    u.searchParams.set("year", String(effectiveYear));
    u.searchParams.set("title", `youreview • ${effectiveYear} Top 10`);
    thumbs.forEach((t) => u.searchParams.append("img", t!));
    return u.toString();
  })();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{effectiveYear} 연말결산</h1>
        <div className="flex gap-2">
          <Link
            href={`/top10/${effectiveYear}`}
            className="px-3 py-2 rounded-md border bg-card hover:bg-accent transition shadow-sm"
          >
            Top10 보드
          </Link>
          <a
            href={ogURL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-md bg-foreground text-background shadow-sm"
          >
            공유 이미지 만들기
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="총 등록"
          value={count}
          sub={`${y}년에 기록한 항목 수`}
        />
        <StatCard title="올해의 영화" value={cMovie} />
        <StatCard title="올해의 음악" value={cMusic} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="올해의 책" value={cBook} />
        <div className="rounded-2xl border p-4 shadow-sm bg-card col-span-2">
          <div className="text-sm text-muted-foreground">월별 등록</div>
          <div className="mt-3 grid grid-cols-12 gap-2">
            {monthly.map((v, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-5 text-[11px] text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="w-5 h-24 bg-muted rounded overflow-hidden flex items-end">
                  <div
                    className="w-full"
                    style={{
                      height: `${Math.min(100, v * 12)}%`,
                      background: "currentColor",
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border p-4 shadow-sm bg-card">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Top10 썸네일</div>
          <a
            href={ogURL}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            OG 이미지 보기
          </a>
        </div>
        <div className="mt-3">
          <ThumbGrid images={thumbs} />
        </div>
      </section>
    </div>
  );
}
