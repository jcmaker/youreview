"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const { isSignedIn } = useAuth();
  const [profilePath, setProfilePath] = useState<string>("/onboarding");
  const [yearPath, setYearPath] = useState<string>("/top10/" + new Date().getFullYear());

  useEffect(() => {
    const y = new Date().getFullYear();
    setYearPath(`/top10/${y}`);
    // best-effort fetch to resolve username for header link
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
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          youreview
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <SignedIn>
            <Link href={yearPath} className="text-sm hover:underline">
              My Top 10
            </Link>
            <Link href="/create/movie" className="text-sm hover:underline">
              Add Movie
            </Link>
            <Link href={profilePath} className="text-sm hover:underline">
              공개 프로필
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-3 py-1 rounded-md border bg-card hover:bg-accent transition shadow-sm">
                로그인
              </button>
            </SignInButton>
          </SignedOut>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
