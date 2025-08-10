"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Provider, UnifiedResult } from "@/types/media";
import { fetchJson } from "@/lib/http/fetchJson";
import { useDebouncedValue } from "./useDebouncedValue";

type UseSearchOpts = {
  category: Category;
  query: string;
  providerOverride?: Provider; // music: 'spotify', book: 'googleBooks'
  enabled?: boolean; // default true
  debounceMs?: number; // default 300ms
};

function buildUrl(
  category: Category,
  q: string,
  providerOverride?: Provider
): string {
  const base =
    category === "movie"
      ? "/api/search/movie"
      : category === "music"
      ? "/api/search/music"
      : "/api/search/book";

  const params = new URLSearchParams({ q });
  if (category === "music" && providerOverride === "spotify") {
    params.set("provider", "spotify");
  }
  if (category === "book" && providerOverride === "googleBooks") {
    params.set("provider", "googleBooks");
  }
  return `${base}?${params.toString()}`;
}

export function useSearch(opts: UseSearchOpts) {
  const {
    category,
    query,
    providerOverride,
    enabled = true,
    debounceMs = 300,
  } = opts;
  const qDebounced = useDebouncedValue(query.trim(), debounceMs);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [category, qDebounced, providerOverride]);

  const url = useMemo(() => {
    if (!qDebounced) return null;
    return buildUrl(category, qDebounced, providerOverride);
  }, [category, qDebounced, providerOverride]);

  const queryKey = useMemo(
    () => ["search", category, providerOverride ?? "default", qDebounced],
    [category, providerOverride, qDebounced]
  );

  const q = useQuery<UnifiedResult[]>({
    queryKey,
    enabled: !!url && enabled,
    queryFn: async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return fetchJson<UnifiedResult[]>(url!, {
        signal: abortRef.current.signal,
      });
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (count, err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (msg.includes("HTTP 400") || msg.includes("HTTP 404")) return false;
      return count < 1;
    },
  });

  return {
    data: q.data ?? [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: (q.error as Error) ?? null,
    refetch: q.refetch,
  };
}
