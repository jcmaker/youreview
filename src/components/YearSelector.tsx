"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentYear: number;
  availableYears?: number[];
  onYearChange?: (year: number) => void;
};

export default function YearSelector({
  currentYear,
  availableYears = [],
  onYearChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

  const handleYearSelect = (year: number) => {
    if (onYearChange) {
      onYearChange(year);
    } else {
      // 현재 경로와 쿼리 파라미터 확인
      const pathname = window.location.pathname;
      const category = searchParams.get("category");

      let newUrl: string;
      if (pathname.startsWith("/u/")) {
        // 사용자 프로필 페이지인 경우
        const username = pathname.split("/")[2]; // /u/[username]에서 username 추출
        newUrl = category
          ? `/u/${username}?category=${category}&year=${year}`
          : `/u/${username}?year=${year}`;
      } else {
        // top10 페이지인 경우
        newUrl = category
          ? `/top10/${year}?category=${category}`
          : `/top10/${year}`;
      }
      router.push(newUrl);
    }
    closeDropdown();
  };

  // availableYears가 비어있으면 기본값(현재-2 ~ 현재+2)
  const years =
    availableYears.length > 0
      ? availableYears
      : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const listboxId = "year-selector-listbox";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-medium",
          "text-foreground bg-background border border-border rounded-lg",
          "hover:bg-accent transition-all duration-200 shadow-sm",
          "min-w-[120px] sm:min-w-[140px] focus:outline-none focus:ring-2 focus:ring-ring",
          isOpen && "border-primary shadow-md"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 text-left">{currentYear}년</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden
          />
          <div
            id={listboxId}
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-auto"
          >
            {years.map((year) => {
              const selected = year === currentYear;
              return (
                <button
                  key={year}
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm sm:text-base",
                    "transition-colors duration-150 flex items-center gap-3",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    selected
                      ? "bg-accent border-y border-primary text-accent-foreground font-semibold"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  {year}년
                  {selected && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
