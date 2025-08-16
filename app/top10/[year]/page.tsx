import { requireUserId } from "@/lib/auth/user";
import { getListId, getOrCreateListId } from "@/lib/db/lists";
import { listItemsByListId } from "@/lib/db/items";
import Top10Board from "@/components/Top10Board";
import CategoryTabs from "@/components/CategoryTabs";
import YearSelector from "@/components/YearSelector";
import VisibilityToggle from "@/components/VisibilityToggle";

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
    return <div className="p-6 text-foreground">Invalid year</div>;
  }
  const currentYear = new Date().getFullYear();

  // 2025년 이전이나 미래 연도는 편집 불가
  const isEditable = yearNum >= 2025 && yearNum <= currentYear;

  const userId = await requireUserId();
  const cat = (sp.category ?? "movie") as "movie" | "music" | "book";
  const listId =
    sp.createList === "1"
      ? await getOrCreateListId(userId, yearNum, cat)
      : (await getListId(userId, yearNum, cat)) ??
        (await getOrCreateListId(userId, yearNum, cat));
  // Fetch visibility for current category/year
  const { data: listRow } = await import("@/lib/supabase/serverAdmin").then(
    async ({ supabaseAdmin }) =>
      await supabaseAdmin
        .from("top10_lists")
        .select("visibility")
        .eq("id", listId)
        .maybeSingle()
  );
  const isPublic = (listRow?.visibility as string) === "public";
  const items = await listItemsByListId(listId);
  const boardEntries = items.map((it) => ({
    id: it.id,
    rank: it.rank,
    userNote: it.user_note,
    userLink: it.user_link,
    media: {
      title: it.media.title,
      creators: it.media.creators,
      imageUrl: it.media.image_url,
      category: it.media.category,
    },
  }));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* 대시보드 헤더 */}
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Top 10 Dashboard
            </h1>
            <YearSelector currentYear={yearNum} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CategoryTabs />
            {isEditable && (
              <VisibilityToggle
                listId={listId}
                isPublic={isPublic}
                category={cat}
                year={yearNum}
              />
            )}
          </div>
        </div>

        {/* 편집 상태 표시 */}
        {!isEditable && (
          <div className="mt-4 p-3 bg-accent border border-border rounded-lg">
            <div className="flex items-center gap-2 text-accent-foreground">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                해당 연도는 편집할 수 없습니다.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top 10 보드 */}
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            {yearNum}년{" "}
            {cat === "movie" ? "영화" : cat === "music" ? "음악" : "책"} Top 10
          </h2>
          {isEditable && boardEntries.length > 0 && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              드래그하여 순서를 변경하거나 편집/삭제할 수 있습니다
            </div>
          )}
        </div>

        {boardEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              아직 데이터가 없습니다
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
              {yearNum}년{" "}
              {cat === "movie" ? "영화" : cat === "music" ? "음악" : "책"} Top
              10을 만들어보세요.
              {isEditable &&
                " 새로운 항목을 추가하여 나만의 리스트를 완성해보세요!"}
            </p>
            {isEditable && (
              <a
                href={`/create/${cat}?year=${yearNum}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium transition-all duration-200 shadow-lg hover:opacity-90"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                첫 번째 항목 추가하기
              </a>
            )}
          </div>
        ) : (
          <Top10Board
            key={`${cat}-${yearNum}`}
            initialEntries={boardEntries}
            listId={listId}
            allowDrag={isEditable}
            allowEdit={isEditable}
          />
        )}
      </div>
    </div>
  );
}
