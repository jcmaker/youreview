"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Menu,
  X,
  Plus,
  User,
  Award,
  Film,
  Music,
  BookOpen,
} from "lucide-react";

export default function Header() {
  const { isSignedIn } = useAuth();
  const [profilePath, setProfilePath] = useState<string>("/onboarding");
  const [top10Path, setTop10Path] = useState<string>("/top10");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setTop10Path(`/top10`);
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

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link
            href="/"
            className="font-bold text-xl sm:text-2xl transition-opacity hover:opacity-80 text-foreground"
          >
            youreview
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <SignedIn>
            {[
              { href: top10Path, label: "Dashboard", icon: Award },
              { href: "/create/movie", label: "Add Movie", icon: Plus },
              { href: profilePath, label: "My Page", icon: User },
            ].map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:bg-popover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </div>
            ))}
          </SignedIn>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden p-2 -mr-2 text-foreground rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Right Side */}
        <nav className="hidden sm:flex items-center gap-3">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "border border-border" } }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200 shadow-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                로그인
              </button>
            </SignInButton>
          </SignedOut>
          <ThemeToggle />
        </nav>

        {/* Mobile Right Side (without menu) */}
        {/* <div className="sm:hidden flex items-center gap-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200 shadow-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                로그인
              </button>
            </SignInButton>
          </SignedOut>
          <ThemeToggle />
        </div> */}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            <SignedIn>
              {[
                { href: top10Path, label: "Dashboard", icon: Award },
                { href: "/create/movie", label: "영화 추가", icon: Film },
                { href: "/create/music", label: "음악 추가", icon: Music },
                { href: "/create/book", label: "책 추가", icon: BookOpen },
                { href: profilePath, label: "My Page", icon: User },
              ].map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg font-medium text-foreground/90 hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: { avatarBox: "border border-border" },
                  }}
                />
                <ThemeToggle />
              </div>
            </SignedIn>
            <div className="flex items-center justify-end gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200 shadow-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    로그인
                  </button>
                </SignInButton>
                <ThemeToggle />
              </SignedOut>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
