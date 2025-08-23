"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Film,
  Music,
  BookOpen,
  User,
} from "lucide-react";

export default function AuthAwareCTA() {
  const { isSignedIn } = useAuth();
  const [profilePath, setProfilePath] = useState<string>("/onboarding");

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        try {
          const res = await fetch("/api/profile/me", { cache: "no-store" });
          if (!res.ok) return;
          const j = (await res.json()) as { username?: string | null };
          if (j.username) setProfilePath(`/u/${j.username}`);
          else setProfilePath("/onboarding");
        } catch {
          setProfilePath("/onboarding");
        }
      })();
    }
  }, [isSignedIn]);

  return (
    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
      {isSignedIn ? (
        <>
          <Link
            href={profilePath}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-2 font-semibold ">
              <User className="w-5 h-5" />
              My Top 10
            </div>
          </Link>

          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { href: "/create/movie", label: "영화 추가", icon: Film },
              { href: "/create/music", label: "음악 추가", icon: Music },
              { href: "/create/book", label: "책 추가", icon: BookOpen },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-5 py-3 rounded-lg border border-muted-foreground hover:bg-card hover:text-background text-center block transition-all duration-200 shadow-sm hover:shadow-md text-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-lg bg-foreground text-background text-center font-bold block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              시작하기 (로그인)
            </div>
          </Link>
          <a
            href="#how"
            className="px-5 py-3 rounded-lg border border-border hover:bg-accent text-center block transition-all duration-200 shadow-sm hover:shadow-md text-foreground"
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              어떻게 동작하나요?
            </div>
          </a>
        </>
      )}
    </div>
  );
}
