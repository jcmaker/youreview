"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CATS = [
  { key: "movie", label: "영화" },
  { key: "music", label: "음악" },
  { key: "book", label: "책" },
] as const;

export type CategoryKey = (typeof CATS)[number]["key"];

export default function CategoryTabs() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const current = (sp.get("category") ?? "movie") as CategoryKey;

  function setCat(nextKey: CategoryKey) {
    const next = new URLSearchParams(sp);
    next.set("category", nextKey);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      {CATS.map((c) => (
        <button
          key={c.key}
          onClick={() => setCat(c.key)}
          className={`px-3 py-1.5 text-sm ${
            current === c.key
              ? "bg-black text-white"
              : "bg-white hover:bg-gray-50"
          }`}
          aria-pressed={current === c.key}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
