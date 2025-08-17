import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import type { Metadata } from "next";
import UserProfileCategoryTabs from "@/components/UserProfileCategoryTabs";
import UserProfileListView from "@/components/UserProfileListView";
import YearSelector from "@/components/YearSelector";
import { requireUserId } from "@/lib/auth/user";
import ScrollableGrid from "@/components/ScrollableGrid";

type Item = {
  id: string;
  rank: number;
  media: { title: string; image_url: string | null; link_url?: string | null };
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ category?: string; year?: string }>;
}) {
  const [{ username }, sp] = await Promise.all([params, searchParams]);
  const uname = (username || "").toLowerCase();
  const category = (sp.category ?? "movie") as "movie" | "music" | "book";
  const yearParam = sp.year;
  const selectedYear = yearParam
    ? parseInt(yearParam, 10)
    : new Date().getFullYear();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, username")
    .ilike("username", uname)
    .maybeSingle();
  if (!profile) return notFound();

  // 현재 로그인한 사용자 확인
  let currentUserId: string | null = null;
  try {
    currentUserId = await requireUserId();
  } catch {
    // 로그인하지 않은 경우
  }

  // 자신의 프로필인지 확인
  const isOwnProfile = currentUserId === profile.id;

  // 사용자의 모든 연도 데이터 가져오기
  const { data: allLists } = await supabaseAdmin
    .from("top10_lists")
    .select("id, category, visibility, year")
    .eq("user_id", profile.id)
    .gt("item_count", 0);

  // 사용 가능한 연도들 추출
  const availableYears = [...new Set(allLists?.map((l) => l.year) || [])].sort(
    (a, b) => b - a
  );

  // 선택된 연도의 리스트들 가져오기
  const { data: lists } = await supabaseAdmin
    .from("top10_lists")
    .select("id, category, visibility")
    .eq("user_id", profile.id)
    .eq("year", selectedYear)
    .gt("item_count", 0);

  // 자신의 프로필이면 모든 리스트, 아니면 public 리스트만
  const availableLists = isOwnProfile
    ? lists || []
    : lists?.filter((l) => l.visibility === "public") || [];

  // 사용 가능한 카테고리들 확인
  const availableCategories = availableLists.map((l) => l.category);

  // 선택된 카테고리에 데이터가 없으면 사용 가능한 첫 번째 카테고리로 변경
  let effectiveCategory = category;
  if (
    !availableCategories.includes(category) &&
    availableCategories.length > 0
  ) {
    effectiveCategory = availableCategories[0] as "movie" | "music" | "book";
  }

  // 선택된 카테고리의 리스트만 필터링
  const selectedList = availableLists?.find(
    (l) => l.category === effectiveCategory
  );

  // 선택된 카테고리가 비공개인지 확인 (자신의 프로필이 아닌 경우)
  const isCategoryPrivate =
    !isOwnProfile &&
    lists?.some(
      (l) => l.category === effectiveCategory && l.visibility === "private"
    );

  let selectedItems: Item[] = [];
  if (selectedList) {
    const { data: raw } = await supabaseAdmin
      .from("top10_items")
      .select(`id, rank, media:media_id ( title, image_url, link_url )`)
      .eq("list_id", selectedList.id)
      .order("rank", { ascending: true });

    type RawItem = {
      id: string;
      rank: number;
      media?: {
        title?: string | null;
        image_url?: string | null;
        link_url?: string | null;
      } | null;
    };

    selectedItems = ((raw ?? []) as RawItem[]).map((r) => ({
      id: r.id,
      rank: r.rank,
      media: {
        title: (r.media?.title ?? "") as string,
        image_url: (r.media?.image_url ?? null) as string | null,
        link_url: (r.media?.link_url ?? null) as string | null,
      },
    }));
  }

  const title = `${
    profile.display_name || profile.username
  } — ${selectedYear} Top 10`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <div className="flex items-center gap-4">
          <YearSelector
            currentYear={selectedYear}
            availableYears={availableYears}
          />
          <UserProfileCategoryTabs
            availableCategories={availableCategories}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>

      {isCategoryPrivate ? (
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            비공개 카테고리입니다
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
            {profile.display_name || profile.username}님이{" "}
            {effectiveCategory === "movie"
              ? "영화"
              : effectiveCategory === "music"
              ? "음악"
              : "책"}{" "}
            카테고리를 비공개로 설정했습니다.
            {availableCategories.length > 0 && " 다른 카테고리를 선택해보세요."}
          </p>
          {availableCategories.length > 0 && (
            <div className="text-sm text-muted-foreground">
              공개된 카테고리:{" "}
              {availableCategories
                .map((cat) =>
                  cat === "movie" ? "영화" : cat === "music" ? "음악" : "책"
                )
                .join(", ")}
            </div>
          )}
        </div>
      ) : selectedItems.length > 0 ? (
        <div className="space-y-4">
          <div className="text-lg font-medium text-foreground">
            {effectiveCategory === "movie"
              ? "🎬 영화"
              : effectiveCategory === "music"
              ? "🎵 음악"
              : "📚 책"}
          </div>

          {/* Grid View - Horizontal scrolling cards with images */}
          <ScrollableGrid items={selectedItems} category={effectiveCategory} />

          {/* List View - Ranked list with clickable links */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-foreground mb-4">
              순위별 목록
            </h3>
            <UserProfileListView items={selectedItems} />
          </div>
        </div>
      ) : (
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
            {selectedYear}년{" "}
            {effectiveCategory === "movie"
              ? "영화"
              : effectiveCategory === "music"
              ? "음악"
              : "책"}{" "}
            Top 10이 아직 없습니다.
            {availableYears.length > 0 && " 다른 연도를 선택해보세요."}
          </p>
          {availableYears.length > 0 && (
            <div className="text-sm text-muted-foreground">
              사용 가능한 연도: {availableYears.join(", ")}년
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const uname = (username || "").toLowerCase();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name, username")
    .ilike("username", uname)
    .maybeSingle();

  if (!profile) {
    return {
      title: "사용자를 찾을 수 없습니다 - youreview",
      description: "요청하신 사용자를 찾을 수 없습니다.",
    };
  }

  const displayName = profile.display_name || profile.username;

  return {
    title: `${displayName}의 Top 10 - youreview`,
    description: `${displayName}의 영화, 음악, 책 Top 10 리스트를 확인하세요.`,
    keywords: [displayName, "Top 10", "영화", "음악", "책", "리스트", "프로필"],
    openGraph: {
      title: `${displayName}의 Top 10 - youreview`,
      description: `${displayName}의 영화, 음악, 책 Top 10 리스트를 확인하세요.`,
      type: "profile",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName}의 Top 10 - youreview`,
      description: `${displayName}의 영화, 음악, 책 Top 10 리스트를 확인하세요.`,
    },
  };
}
