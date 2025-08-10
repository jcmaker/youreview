import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import RotatingText from "@/components/RotatingText";
import { Heart, Sparkles, Share2, Clock } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const isAuthed = !!userId;

  return (
    <div className="relative">
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-2">
          My Top 10{" "}
          <RotatingText
            words={["Movie!", "Music!", "Books!"]}
            intervalMs={2000}
            className="px-2 sm:px-2 md:px-3 text-black font-bold text-4xl sm:text-5xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          />
        </h1>
        <h2 className="text-3xl font-semibold">한 해의 취향을 Top 10으로</h2>
        <p className="mt-4 text-gray-600 text-lg">
          영화 · 음악 · 책 — 링크로 검색, 드래그로 순위, 연말엔 카드로 공유.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthed ? (
            <>
              <Link
                href={`/top10/${new Date().getFullYear()}`}
                className="px-5 py-3 rounded bg-black text-white"
              >
                내 올해 Top 10
              </Link>
              <Link
                href="/create/movie"
                className="px-5 py-3 rounded border hover:bg-gray-50"
              >
                영화 추가
              </Link>
              <Link
                href="/create/music"
                className="px-5 py-3 rounded border hover:bg-gray-50"
              >
                음악 추가
              </Link>
              <Link
                href="/create/book"
                className="px-5 py-3 rounded border hover:bg-gray-50"
              >
                책 추가
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-5 py-3 rounded bg-black text-white"
              >
                시작하기 (로그인)
              </Link>
              <a
                href="#how"
                className="px-5 py-3 rounded border hover:bg-gray-50"
              >
                어떻게 동작하나요?
              </a>
            </>
          )}
        </div>
      </section>

      {/* Preview / Gallery Section */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">미리보기</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["영화 Top 10", "음악 Top 10", "책 Top 10"].map((title, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-[360px] snap-start rounded-2xl border shadow-sm p-4"
            >
              <div className="text-sm text-muted-foreground mb-2">샘플</div>
              <div className="font-semibold mb-3">{title}</div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-md bg-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t">
        <div className="max-w-5xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold">1. 검색해서 고르기</div>
            <p className="text-sm text-gray-600 mt-2">
              TMDB/YouTube/Spotify/네이버·구글북스로 빠르게 찾기
            </p>
          </div>
          <div>
            <div className="font-semibold">2. 순위 정하기</div>
            <p className="text-sm text-gray-600 mt-2">
              드래그 앤 드롭으로 1~10위 정렬
            </p>
          </div>
          <div>
            <div className="font-semibold">3. 연말결산</div>
            <p className="text-sm text-gray-600 mt-2">
              카드 이미지로 뽑아 SNS 공유
            </p>
          </div>
        </div>
      </section>

      {/* Why / Value Proposition */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-4">왜 Top 10을 기록하나요?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">기억을 오래</span>
            </div>
            <p className="text-sm text-muted-foreground">
              한 해의 취향 기록을 한곳에 모아두세요.
            </p>
          </div>
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">취향 발견</span>
            </div>
            <p className="text-sm text-muted-foreground">
              연말에 보면 나만의 패턴이 보여요.
            </p>
          </div>
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4" />
              <span className="font-medium">애정 재발견</span>
            </div>
            <p className="text-sm text-muted-foreground">
              좋아했던 작품들을 다시 꺼내보세요.
            </p>
          </div>
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4" />
              <span className="font-medium">쉽게 공유</span>
            </div>
            <p className="text-sm text-muted-foreground">
              OG 이미지로 SNS에 바로 공유할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-4">사용자 이야기</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Sofia", "Ken", "Ari"].map((name, i) => (
            <div key={i} className="rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="text-sm font-medium">{name}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                작년 Top 10을 만들고 나니 제 취향을 더 잘 알게 됐어요. 연말이
                기다려집니다!
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Re-engage CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl border p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">
              올해 나만의 Top 10을 시작하세요
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              지금 바로 첫 작품을 추가해보세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/create/movie"
              className="px-4 py-2 rounded-md bg-black text-white"
            >
              영화 추가
            </Link>
            <Link
              href="/create/music"
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              음악 추가
            </Link>
            <Link
              href="/create/book"
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              책 추가
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
