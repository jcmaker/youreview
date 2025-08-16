"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Film, Music, BookOpen } from "lucide-react";

const tabs = [
  { name: "movie", label: "영화", icon: Film, href: "/create/movie" },
  { name: "music", label: "음악", icon: Music, href: "/create/music" },
  { name: "book", label: "책", icon: BookOpen, href: "/create/book" },
] as const;

export default function CreateCategoryTabs() {
  const pathname = usePathname();
  const currentCategory = pathname.split("/").pop() || "movie";

  return (
    <div className="flex gap-2 p-2 bg-card rounded-xl border border-border shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.name === currentCategory;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            title={tab.label}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center focus:outline-none focus:ring-2 focus:ring-ring",
              isActive
                ? "bg-foreground text-background shadow-md border border-foreground"
                : "text-foreground/80 border border-transparent hover:bg-accent"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="sr-only">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
