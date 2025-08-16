"use client";

import { useState, useTransition } from "react";
import { setListVisibility } from "@/app/actions/setListVisibility";
import { Globe, Lock } from "lucide-react";

type Props = {
  listId: string; // 현재 액션에선 미사용이지만 프롭은 유지
  isPublic: boolean;
  category: "movie" | "music" | "book";
  year?: number;
};

export default function VisibilityToggle({ isPublic, category, year }: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string>("");

  const toggleVisibility = () => {
    startTransition(async () => {
      try {
        await setListVisibility({ category, year, visible: !isPublic });
        setToast(
          isPublic ? "비공개로 변경되었습니다" : "공개로 변경되었습니다"
        );
        setTimeout(() => setToast(""), 3000);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "실패";
        setToast(`에러: ${msg}`);
        setTimeout(() => setToast(""), 3000);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleVisibility}
        disabled={isPending}
        aria-pressed={isPublic}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring
          ${
            isPublic
              ? "bg-foreground text-background border border-foreground hover:opacity-90"
              : "bg-background text-foreground border border-border hover:bg-accent"
          }
          ${isPending ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}
        `}
      >
        {isPending ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPublic ? (
          <Globe className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        {isPublic ? "공개" : "비공개"}
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            px-3 py-2 rounded-lg text-sm font-medium border
            ${
              toast.startsWith("에러")
                ? "bg-destructive/10 border-destructive text-destructive"
                : "bg-accent border-primary text-accent-foreground"
            }
          `}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
