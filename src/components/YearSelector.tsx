"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const toggleDropdown = useCallback(() => setIsOpen((v) => !v), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const handleYearSelect = useCallback(
    (year: number) => {
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
    },
    [onYearChange, searchParams, router, closeDropdown]
  );

  // availableYears가 비어있으면 기본값(현재-2 ~ 현재+2)
  const years = useMemo(() => {
    return availableYears.length > 0
      ? availableYears
      : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  }, [availableYears]);

  const listboxId = "year-selector-listbox";

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={listboxId}
        className="min-w-[120px] justify-between"
      >
        <span id={listboxId}>{currentYear}년</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <ul role="listbox" aria-labelledby={listboxId} className="py-1">
              {years.map((year) => (
                <li
                  key={year}
                  role="option"
                  aria-selected={year === currentYear}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors ${
                    year === currentYear
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  }`}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}년
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
