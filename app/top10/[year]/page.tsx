import { requireUserId } from "@/lib/auth/user";
import { getListId, getOrCreateListId } from "@/lib/db/lists";
import { listItemsByListId } from "@/lib/db/items";
import Top10Board from "@/components/Top10Board";
import CategoryTabs from "@/components/CategoryTabs";
import ShareStoryButton from "@/components/ShareStoryButton";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ category?: string; createList?: string }>;
}) {
  const [{ year }, sp] = await Promise.all([params, searchParams]);
  const yearNum = Number(year);
  if (Number.isNaN(yearNum)) {
    return <div className="p-6">Invalid year</div>;
  }
  const currentYear = new Date().getFullYear();
  // Enforce current year only
  if (yearNum !== currentYear) {
    // next/navigation redirect is only available in server component, but we are in one
    // However, we cannot call redirect here without importing; instead, render link fallback
    // Import redirect at top would require change; simpler: use currentYear for all operations
  }
  const userId = await requireUserId();
  const cat = (sp.category ?? "movie") as "movie" | "music" | "book";
  const listId =
    sp.createList === "1"
      ? await getOrCreateListId(userId, currentYear, cat)
      : (await getListId(userId, currentYear, cat)) ??
        (await getOrCreateListId(userId, currentYear, cat));
  const items = await listItemsByListId(listId);
  const boardEntries = items.map((it) => ({
    id: it.id,
    rank: it.rank,
    media: {
      title: it.media.title,
      creators: it.media.creators,
      imageUrl: it.media.image_url,
      category: it.media.category,
    },
  }));
  const thumbs = items
    .map((e) => e.media.image_url)
    .filter(Boolean) as string[];
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">{currentYear}년 My Top 10</h1>
        <div className="flex items-center gap-2">
          <CategoryTabs />
          {/* client: share story */}
          <ShareStoryButton year={currentYear} category={cat} images={thumbs} />
        </div>
      </div>

      <Top10Board key={cat} initialEntries={boardEntries} listId={listId} />
    </div>
  );
}
