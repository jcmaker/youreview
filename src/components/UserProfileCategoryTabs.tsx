"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Film, Music, BookOpen } from "lucide-react";
// import { useMemo, useCallback } from "react";
import { useMemo } from "react";

const tabs = [
  { name: "movie", label: "영화", icon: Film },
  { name: "music", label: "음악", icon: Music },
  { name: "book", label: "책", icon: BookOpen },
] as const;

type Props = {
  availableCategories?: string[];
  isOwnProfile?: boolean;
};

export default function UserProfileCategoryTabs({
  availableCategories = [],
  isOwnProfile = false,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "movie";

  // /u/username 에서 username 추출
  const username = useMemo(() => {
    const usernameMatch = pathname.match(/\/u\/([^\/]+)/);
    return usernameMatch ? usernameMatch[1] : "";
  }, [pathname]);

  // 탭 상태를 메모이제이션
  const tabStates = useMemo(() => {
    return tabs.map((tab) => {
      const isActive = tab.name === currentCategory;
      const isAvailable =
        isOwnProfile || availableCategories.includes(tab.name);
      const isPrivate = !isAvailable; // 본인 프로필에서도 비공개 상태 표시

      const href =
        tab.name === "movie"
          ? `/u/${username}`
          : `/u/${username}?category=${tab.name}`;

      return {
        ...tab,
        isActive,
        isAvailable,
        isPrivate,
        href,
      };
    });
  }, [currentCategory, isOwnProfile, availableCategories, username]);

  // const handleClick = useCallback(
  //   (e: React.MouseEvent, isAvailable: boolean, isPrivate: boolean) => {
  //     // 모든 카테고리를 자유롭게 클릭할 수 있음
  //   },
  //   []
  // );

  return (
    <div className="flex gap-1 p-1 bg-card rounded-xl border border-border shadow-sm">
      {tabStates.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          aria-current={tab.isActive ? "page" : undefined}
          title={tab.isPrivate ? `${tab.label} (비공개)` : tab.label}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring relative",
            tab.isActive && tab.isAvailable
              ? "bg-foreground text-background shadow-md border border-foreground"
              : tab.isActive && tab.isPrivate
              ? "bg-accent text-accent-foreground shadow-md border border-accent"
              : tab.isPrivate
              ? "text-muted-foreground/60 border border-transparent hover:bg-accent/50"
              : "text-foreground/80 border border-transparent hover:bg-accent"
          )}
          // onClick={(e) => handleClick(e, tab.isAvailable, tab.isPrivate)}
        >
          <tab.icon className="w-4 h-4" />
          <span className="sr-only">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
