import Link from "next/link";
import RotatingText from "@/components/RotatingText";
import CurvedLoop from "@/components/CurvedLoop";
import AuthAwareCTA from "@/components/AuthAwareCTA";
import type { Metadata } from "next";
import {
  Heart,
  Share2,
  Clock,
  Star,
  Search,
  BarChart3,
  PartyPopper,
  User,
  Palette,
  Mic,
  Instagram,
} from "lucide-react";

export const metadata: Metadata = {
  title: "youreview - 한 해의 취향을 Top 10으로",
  description:
    "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요. 연말엔 카드로 공유할 수 있습니다.",
  keywords: [
    "Top 10",
    "영화",
    "음악",
    "책",
    "연말결산",
    "취향",
    "리스트",
    "공유",
  ],
  openGraph: {
    title: "youreview - 한 해의 취향을 Top 10으로",
    description:
      "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "youreview - 한 해의 취향을 Top 10으로",
    description:
      "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요.",
  },
};

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            My Top 10{" "}
            <RotatingText
              texts={["Movie", "Music", "Books"]}
              /* 배경=foreground(라이트=블랙, 다크=그린), 텍스트=background(라이트=그린, 다크=그레이900) */
              mainClassName="px-2 sm:px-2 md:px-3 bg-foreground text-background overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg shadow-lg"
              staggerFrom="last"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </h1>

          {/* 서브 타이틀/설명: 토큰 기반으로 단색화 */}
          <h2 className="text-2xl sm:text-3xl font-semibold mt-6 sm:mt-10 text-foreground">
            한 해의 취향을 Top 10으로
          </h2>
          <p className="mt-3 sm:mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            영화 · 음악 · 책 — 링크로 검색, 드래그로 순서, 연말엔 카드로 공유.
          </p>

          {/* CTA Buttons */}
          <AuthAwareCTA />
        </div>
      </section>

      {/* Curved Loop Animation Section */}
      <section>
        <div className="p-6 sm:p-8">
          {/* 텍스트색만 전역 토큰을 따르도록 */}
          <CurvedLoop
            marqueeText="La La Land ✦ Inception ✦ Parasite ✦ NewJeans ✦ BTS ✦ Harry Potter ✦ F1 ✦ Blackpink ✦"
            speed={1.5}
            // size="medium"
            interactive={true}
            curveAmount={150}
            className="font-bold text-foreground"
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">
            어떻게 동작하나요?
          </h2>

          {/* 컬러 배지는 모두 그린 그라디언트로 통일 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "검색해서 고르기",
                desc: "TMDB / Spotify / Naver·Google Books로 빠르게 찾기",
                icon: Search,
              },
              {
                step: "2",
                title: "순위 정하기",
                desc: "Drag & Drop 으로 1~10위 정렬",
                icon: BarChart3,
              },
              {
                step: "3",
                title: "연말결산",
                desc: "카드 이미지로 뽑아 SNS 공유",
                icon: PartyPopper,
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-[rgb(21,128,61)] flex items-center justify-center text-background shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="text-sm text-foreground/80 font-semibold mb-2">
                  STEP {item.step}
                </div>
                <div className="font-bold text-lg sm:text-xl text-foreground mb-3">
                  {item.title}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why / Value Proposition */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-8 sm:mb-12">
          왜 Top 10을 기록하나요?
        </h2>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Clock,
              title: "기억을 오래",
              desc: "한 해의 취향 기록을 한곳에 모아두세요.",
            },
            {
              icon: Clock,
              title: "취향 발견",
              desc: "연말에 보면 나만의 패턴이 보여요.",
            },
            {
              icon: Heart,
              title: "애정 재발견",
              desc: "좋아했던 작품들을 다시 꺼내보세요.",
            },
            {
              icon: Share2,
              title: "쉽게 공유",
              desc: "OG 이미지로 SNS에 바로 공유할 수 있어요.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border shadow-lg p-6 hover:shadow-xl transition-all duration-300 bg-card group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-[rgb(21,128,61)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-6 w-6 text-background" />
              </div>
              <div className="font-bold text-lg text-foreground mb-3">
                {item.title}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-8 sm:mb-12">
          사용자 이야기
        </h2>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
          {[
            { name: "Sofia", avatar: User },
            { name: "Ken", avatar: Palette },
            { name: "Ari", avatar: Mic },
          ].map((user, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border shadow-lg p-6 hover:shadow-xl transition-all duration-300 bg-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-[rgb(21,128,61)] flex items-center justify-center text-background shadow-md">
                  <user.avatar className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{user.name}</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 text-primary fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                작년 Top 10을 만들고 나니 제 취향을 더 잘 알게 됐어요. 연말이
                기다려집니다!
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Re-engage CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-3xl border border-border shadow-xl p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-[rgb(21,128,61,0.12)] hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                올해 나만의 Top 10을 시작하세요
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                지금 바로 첫 작품을 추가해보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/create/movie"
                className="px-4 py-3 rounded-lg bg-foreground text-background text-center text-sm block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M6 4h12M4 16h16M4 12h16"
                    />
                  </svg>
                  영화 추가
                </div>
              </Link>
              <Link
                href="/create/music"
                className="px-4 py-3 rounded-lg bg-foreground text-background text-center text-sm block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  음악 추가
                </div>
              </Link>
              <Link
                href="/create/book"
                className="px-4 py-3 rounded-lg bg-foreground text-background text-center text-sm block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  책 추가
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-xl text-foreground">
                  youreview
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                한 해의 취향을 Top 10으로 기록하고 공유하는 플랫폼입니다. 영화,
                음악, 책을 검색하고 순위를 정해 나만의 리스트를 만들어보세요.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground font-bold flex items-center justify-center">
                  Contact:
                </div>
                <Link
                  href="https://www.instagram.com/justinsta_627"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="mailto:jcmaker0627@gmail.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Email"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/top10"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create/movie"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    영화 추가
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create/music"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    음악 추가
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create/book"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    책 추가
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    사용법
                  </a>
                </li>
                <li>
                  <Link
                    href="/sign-in"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    로그인
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    회원가입
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border mt-8 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                © 2025 youreview. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by{" "}
                <Link
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  TMDB
                </Link>
                ,{" "}
                <Link
                  href="https://open.spotify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Spotify
                </Link>
                ,{" "}
                <Link
                  href="https://developers.naver.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Naver
                </Link>
                , and{" "}
                <Link
                  href="https://developers.google.com/books"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Google Books
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
