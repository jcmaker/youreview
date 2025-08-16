"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Film, Music, BookOpen, Lock } from "lucide-react";

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
  const usernameMatch = pathname.match(/\/u\/([^\/]+)/);
  const username = usernameMatch ? usernameMatch[1] : "";

  return (
    <div className="flex gap-1 p-1 bg-card rounded-xl border border-border shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.name === currentCategory;
        const isAvailable =
          isOwnProfile || availableCategories.includes(tab.name);
        const isPrivate = !isOwnProfile && !isAvailable;

        const href =
          tab.name === "movie"
            ? `/u/${username}`
            : `/u/${username}?category=${tab.name}`;

        return (
          <Link
            key={tab.name}
            href={isAvailable ? href : "#"}
            aria-current={isActive ? "page" : undefined}
            title={isPrivate ? `${tab.label} (비공개)` : tab.label}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring relative",
              isActive && isAvailable
                ? "bg-foreground text-background shadow-md border border-foreground"
                : isPrivate
                ? "text-muted-foreground/50 border border-transparent cursor-not-allowed opacity-50"
                : "text-foreground/80 border border-transparent hover:bg-accent"
            )}
            onClick={(e) => {
              if (!isAvailable) {
                e.preventDefault();
              }
            }}
          >
            <tab.icon className="w-4 h-4" />
            {isPrivate && (
              <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />
            )}
            <span className="sr-only">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
