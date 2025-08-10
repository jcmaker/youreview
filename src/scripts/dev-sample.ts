import { upsertMediaByProvider } from "@/lib/db/media";
import { createOrUpdateEntry, listEntriesByYear } from "@/lib/db/top10";
import type { Category, Provider } from "@/types/db";

export async function runDevSample(): Promise<void> {
  const category: Category = "movie";
  const provider: Provider = "tmdb";

  const media = await upsertMediaByProvider({
    category,
    provider,
    providerId: "12345",
    title: "Example Movie",
    creators: ["Director Name"],
    description: "An example movie for dev sample",
    imageUrl: "https://example.com/poster.jpg",
    linkUrl: "https://example.com",
    releaseDate: "2024-12-31",
    extra: { language: "en" },
  });

  const userId = "00000000-0000-0000-0000-000000000000";
  const year = 2025;

  await createOrUpdateEntry({
    userId,
    year,
    rank: 1,
    mediaId: media.id,
    userNote: "Loved it!",
    userLink: "https://myreview.example.com",
  });

  const list = await listEntriesByYear(userId, year);
  console.log("Top10 list", list);
}

// Not executed automatically; import and call runDevSample() to try.
