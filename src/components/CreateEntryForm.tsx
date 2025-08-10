"use client";

import { useState, useTransition } from "react";
import type { Category, UnifiedResult } from "@/types/media";
import { savePickedItem } from "@/app/actions/top10";
import SearchModal from "@/components/SearchModal";

type Props = {
  category: Category;
};

export default function CreateEntryForm({ category }: Props) {
  const [picked, setPicked] = useState<UnifiedResult | null>(null);
  const [userNote, setUserNote] = useState("");
  const [userLink, setUserLink] = useState("");
  // rank input removed; server auto-assigns next position
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  function onPick(item: UnifiedResult) {
    setPicked(item);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) {
      setMessage("검색에서 항목을 선택하세요.");
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
          userLink: userLink.trim() || undefined,
          extra: picked.extra,
        });
        setMessage(`저장 완료! ${res.year}년 rank #${res.rank}`);
        setPicked(null);
        setUserNote("");
        setUserLink("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        setMessage(`저장 실패: ${msg}`);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* 선택된 항목 프리뷰 + 검색 버튼 */}
      <div className="flex items-start gap-4">
        <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {picked?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picked.imageUrl}
              alt={picked.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500">선택된 항목</div>
          <div className="font-medium truncate">{picked?.title ?? "없음"}</div>
          {picked?.creators?.length ? (
            <div className="text-sm text-gray-600 truncate">
              {picked.creators.join(", ")}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="px-3 py-2 text-sm rounded border hover:bg-gray-50"
          onClick={() => setOpen(true)}
        >
          {picked ? "다시 검색" : "검색하기"}
        </button>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">설명/리뷰 (선택)</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[90px]"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="간단한 감상/메모를 남겨보세요."
          />
        </div>
        <div>
          <label className="block text-sm mb-1">관련 링크 (선택)</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="url"
            inputMode="url"
            placeholder="https://..."
            value={userLink}
            onChange={(e) => setUserLink(e.target.value)}
          />
        </div>
        {/* 순위 입력란 제거: 서버가 자동 배정 */}
        <div className="text-sm text-gray-600">{message}</div>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
      </form>

      {/* 모달 */}
      <SearchModal
        open={open}
        onClose={() => setOpen(false)}
        category={category}
        onPick={(item) => {
          onPick(item);
          setOpen(false);
        }}
      />
    </div>
  );
}
