"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, Provider, UnifiedResult } from "@/types/media";
import { useSearch } from "@/hooks/useSearch";

type Props = {
  open: boolean;
  onClose: () => void;
  category: Category;
  onPick: (item: UnifiedResult) => void;
};

export default function SearchModal({
  open,
  onClose,
  category,
  onPick,
}: Props) {
  const [q, setQ] = useState("");
  const [bookProvider, setBookProvider] = useState<Provider>("naverBooks");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const providerOverride =
    category === "music"
      ? "spotify" // 음악은 항상 Spotify 사용
      : category === "book"
      ? bookProvider === "googleBooks"
        ? "googleBooks"
        : undefined
      : undefined;

  const { data, isLoading, isFetching, isError, error } = useSearch({
    category,
    query: q,
    providerOverride,
    debounceMs: 250,
    enabled: open,
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Simple focus trap inside modal
  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    if (!root) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled")
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    root.addEventListener("keydown", handler);
    return () => root.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 top-10 mx-auto w-[min(900px,92vw)] rounded-xl bg-card border border-border shadow-2xl"
        ref={containerRef}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <span className="text-xs sm:text-sm px-2 py-1 rounded bg-accent text-accent-foreground border border-primary">
            {category}
          </span>

          {category === "book" && (
            <select
              className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={bookProvider}
              onChange={(e) => setBookProvider(e.target.value as Provider)}
            >
              <option value="naverBooks">Naver</option>
              <option value="googleBooks">Google</option>
            </select>
          )}

          <input
            ref={inputRef}
            placeholder={
              category === "movie"
                ? "e.g., La La Land"
                : category === "music"
                ? "e.g., NewJeans"
                : "e.g., 작별인사"
            }
            className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            onClick={onClose}
            className="text-sm text-foreground/80 px-2 py-1 hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            닫기
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-2">
            {isLoading
              ? "검색 중…"
              : isFetching
              ? "업데이트 중…"
              : "검색어를 입력하세요"}
            {isError && (
              <span className="text-destructive ml-2">
                에러: {error?.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
            {data.map((item) => (
              <button
                key={`${item.provider}:${item.providerId}`}
                onClick={() => {
                  onPick(item);
                  onClose();
                }}
                className="text-left p-3 border border-border rounded bg-background hover:bg-accent hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
              >
                <div className="w-full aspect-[16/9] bg-muted rounded overflow-hidden mb-2 border border-border">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="font-medium line-clamp-2 text-foreground">
                  {item.title}
                </div>
                {item.creators?.length ? (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {item.creators.join(", ")}
                  </div>
                ) : null}
                <div className="text-[11px] text-foreground/70 mt-1 bg-card px-2 py-1 rounded-full inline-block border border-border">
                  {item.provider}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
