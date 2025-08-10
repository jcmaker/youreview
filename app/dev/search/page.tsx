"use client";

import { useState } from "react";
import type { Category, Provider, UnifiedResult } from "@/types/media";
import { useSearch } from "@/hooks/useSearch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

function ResultCard({ item }: { item: UnifiedResult }) {
  return (
    <a
      href={item.linkUrl ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 p-3 rounded-lg border hover:shadow-sm transition"
    >
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs text-gray-400">no image</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.title}</div>
        {item.creators?.length ? (
          <div className="text-sm text-gray-600 truncate">
            {item.creators.join(", ")}
          </div>
        ) : null}
        {item.releaseDate ? (
          <div className="text-xs text-gray-500">{item.releaseDate}</div>
        ) : null}
        <div className="mt-1 text-xs text-gray-500">{item.provider}</div>
      </div>
    </a>
  );
}

function SearchPlayground() {
  const [category, setCategory] = useState<Category>("movie");
  const [q, setQ] = useState("");
  const [musicProvider, setMusicProvider] = useState<Provider>("youtube");
  const [bookProvider, setBookProvider] = useState<Provider>("naverBooks");

  const providerOverride =
    category === "music"
      ? musicProvider === "spotify"
        ? "spotify"
        : undefined
      : category === "book"
      ? bookProvider === "googleBooks"
        ? "googleBooks"
        : undefined
      : undefined;

  const { data, isLoading, isFetching, isError, error } = useSearch({
    category,
    query: q,
    providerOverride,
    debounceMs: 300,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Search Dev Page</h1>

      {/* Category tabs */}
      <div className="inline-flex rounded-lg border overflow-hidden">
        {(["movie", "music", "book"] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 text-sm ${
              category === c
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Provider toggles */}
      <div className="mt-3 flex gap-3 items-center">
        {category === "music" && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Music Provider:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={musicProvider}
              onChange={(e) => setMusicProvider(e.target.value as Provider)}
            >
              <option value="youtube">YouTube (default)</option>
              <option value="spotify">Spotify</option>
            </select>
          </div>
        )}
        {category === "book" && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Book Provider:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={bookProvider}
              onChange={(e) => setBookProvider(e.target.value as Provider)}
            >
              <option value="naverBooks">Naver (default)</option>
              <option value="googleBooks">Google</option>
            </select>
          </div>
        )}
      </div>

      {/* Search input */}
      <div className="mt-4">
        <label className="block text-sm text-gray-700 mb-1">Query</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={
            category === "movie"
              ? "e.g., Oppenheimer"
              : category === "music"
              ? "e.g., NewJeans"
              : "e.g., Harry Potter"
          }
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="mt-3 text-sm text-gray-600">
        {isLoading ? "Loading..." : isFetching ? "Updating..." : null}
        {isError ? (
          <span className="text-red-600 ml-2">Error: {error?.message}</span>
        ) : null}
      </div>

      {/* Results grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => (
          <ResultCard key={`${item.provider}:${item.providerId}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={qc}>
      <SearchPlayground />
    </QueryClientProvider>
  );
}
