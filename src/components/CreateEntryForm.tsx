"use client";

import { useState, useTransition, useEffect } from "react";
import type { Category, UnifiedResult } from "@/types/media";
import { savePickedItem } from "@/app/actions/top10";
import { useSearch } from "@/hooks/useSearch";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Film,
  Music,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Props = {
  category: Category;
};

export default function CreateEntryForm({ category }: Props) {
  const [picked, setPicked] = useState<UnifiedResult | null>(null);
  const [userNote, setUserNote] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  // 검색 훅
  const { data: searchResults, isLoading: isSearching } = useSearch({
    category,
    query: titleQuery,
    providerOverride: category === "music" ? "spotify" : undefined,
    debounceMs: 300,
    enabled: titleQuery.length > 0,
  });

  useEffect(() => {
    setShowSearchResults(titleQuery.length > 0 && !picked);
  }, [titleQuery, picked]);

  function onPick(item: UnifiedResult) {
    setPicked(item);
    setTitleQuery(item.title);
    setShowSearchResults(false);
  }

  function clearSelection() {
    setPicked(null);
    setTitleQuery("");
    setShowSearchResults(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) {
      setMessage("제목을 입력하고 항목을 선택하세요.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      try {
        const res = await savePickedItem({
          category,
          provider: picked.provider,
          providerId: picked.providerId,
          title: picked.title,
          creators: picked.creators,
          description: picked.description,
          imageUrl: picked.imageUrl,
          linkUrl: picked.linkUrl,
          releaseDate: picked.releaseDate,
          userNote,
          userLink: picked.linkUrl || undefined,
          extra: picked.extra,
        });
        setMessage(`저장 완료! ${res.year}년 rank #${res.rank}`);
        setPicked(null);
        setTitleQuery("");
        setUserNote("");
        setShowSearchResults(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        setMessage(`저장 실패: ${msg}`);
      }
    });
  }

  const CategoryIcon =
    category === "movie" ? Film : category === "music" ? Music : BookOpen;

  return (
    <div className="space-y-6">
      {/* 제목 입력란 */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          제목 <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            className="w-full border border-foreground rounded-xl pl-10 pr-4 py-3 text-sm sm:text-base focus:outline-black focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder={
              category === "movie"
                ? "영화 제목을 입력하세요 (예: 라라랜드)"
                : category === "music"
                ? "음악 제목을 입력하세요 (예: NewJeans)"
                : "책 제목을 입력하세요 (예: 작별인사)"
            }
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
          />
        </div>

        {picked && (
          <div className="mt-3 p-3 bg-accent rounded-lg border border-primary">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm text-accent-foreground font-medium">
                선택됨: {picked.title}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="ml-auto text-foreground/80 hover:underline text-sm font-medium"
              >
                다시 선택
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 검색 결과 */}
      {showSearchResults && (
        <div className="border border-border rounded-xl p-4 sm:p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-[rgb(21,128,61)] flex items-center justify-center text-background text-sm shadow-md">
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div className="text-sm sm:text-base text-foreground font-medium">
              {isSearching ? "검색 중..." : "검색 결과"}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 max-h-[400px] sm:max-h-[600px] overflow-auto">
            {isSearching
              ? Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-3 border border-border rounded-lg bg-card shadow-sm"
                  >
                    <Skeleton className="w-full aspect-[2/3] mb-2 rounded-md" />
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                ))
              : searchResults.map((item) => (
                  <button
                    key={`${item.provider}:${item.providerId}`}
                    onClick={() => onPick(item)}
                    className="text-left p-2 sm:p-3 border border-border rounded-lg bg-background hover:bg-accent hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 group"
                  >
                    <div
                      className={`w-full rounded-md overflow-hidden mb-2 border border-border bg-muted ${
                        category === "music" ? "aspect-square" : "aspect-[2/3]"
                      }`}
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          width={category === "music" ? 200 : 200}
                          height={category === "music" ? 200 : 300}
                        />
                      ) : null}
                    </div>

                    <div className="font-semibold line-clamp-2 text-xs sm:text-sm text-foreground mb-1">
                      {item.title}
                    </div>
                    {item.creators?.length ? (
                      <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                        {item.creators.join(", ")}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[8px] sm:text-[10px] text-foreground/70 bg-accent px-1.5 py-0.5 rounded-full">
                        {item.provider}
                      </div>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
          </div>

          {searchResults.length === 0 &&
            !isSearching &&
            titleQuery.length > 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-3 flex justify-center">
                  <Search className="w-12 h-12" />
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              </div>
            )}
        </div>
      )}

      {/* 선택된 항목 프리뷰 */}
      {picked && (
        <div className="border border-primary rounded-xl p-4 sm:p-6 bg-accent">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-border shadow-sm bg-muted ${
                category === "music"
                  ? "w-16 h-16 sm:w-20 sm:h-20"
                  : "w-12 h-18 sm:w-16 sm:h-24"
              }`}
            >
              {picked?.imageUrl ? (
                <Image
                  src={picked.imageUrl}
                  alt={picked.title}
                  className="w-full h-full object-cover"
                  width={category === "music" ? 80 : 64}
                  height={category === "music" ? 80 : 96}
                />
              ) : (
                <span className="text-xs text-muted-foreground">No Image</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-accent-foreground" />
                <span className="text-sm text-accent-foreground font-medium">
                  선택된 항목
                </span>
              </div>
              <div className="font-bold truncate text-sm sm:text-base text-foreground mb-1">
                {picked.title}
              </div>
              {picked.creators?.length ? (
                <div className="text-xs sm:text-sm text-muted-foreground truncate mb-2">
                  {picked.creators.join(", ")}
                </div>
              ) : null}
              <div className="text-[10px] sm:text-[11px] text-foreground/70 bg-background px-2 py-1 rounded-full inline-block border border-border">
                {picked.provider}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 입력 폼 */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            설명/리뷰{" "}
            <span className="text-muted-foreground font-normal">(선택)</span>
          </label>
          <Textarea
            className="w-full border border-foreground rounded-xl px-4 py-3 min-h-[100px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="간단한 감상/메모를 남겨보세요."
          />
        </div>

        {picked?.linkUrl && (
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              관련 링크{" "}
              <span className="text-muted-foreground font-normal">
                (자동 설정)
              </span>
            </label>
            <div className="w-full border border-border rounded-xl px-4 py-3 bg-card text-xs sm:text-sm text-foreground break-all">
              {picked.linkUrl}
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg border ${
              message.includes("완료")
                ? "bg-accent border-primary text-accent-foreground"
                : "bg-destructive/10 border-destructive text-destructive"
            }`}
          >
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-foreground text-background disabled:opacity-50 font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 shadow-lg hover:opacity-90 transform hover:-translate-y-0.5 disabled:transform-none"
        >
          <div className="flex items-center justify-center gap-2">
            {isPending ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isPending ? "저장 중…" : "저장"}
          </div>
        </Button>
      </form>
    </div>
  );
}
