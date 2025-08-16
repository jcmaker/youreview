"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Film, Music, BookOpen } from "lucide-react";

const tabs = [
  { name: "movie", label: "영화", icon: Film },
  { name: "music", label: "음악", icon: Music },
  { name: "book", label: "책", icon: BookOpen },
] as const;

export default function CategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "movie";

  // /top10/2025 형태에서 연도 추출
  const yearMatch = pathname.match(/\/top10\/(\d+)/);
  const currentYear = yearMatch
    ? yearMatch[1]
    : new Date().getFullYear().toString();

  return (
    <div className="flex gap-1 p-1 bg-card rounded-xl border border-border shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.name === currentCategory;
        const href =
          tab.name === "movie"
            ? `/top10/${currentYear}`
            : `/top10/${currentYear}?category=${tab.name}`;

        return (
          <Link
            key={tab.name}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring",
              isActive
                ? "bg-foreground text-background shadow-md border border-foreground"
                : "text-foreground/80 border border-transparent hover:bg-accent"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
