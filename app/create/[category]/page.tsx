import { notFound, redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import type { Category } from "@/types/media";
import CreateEntryForm from "@/components/CreateEntryForm";
import CreateCategoryTabs from "@/components/CreateCategoryTabs";

const valid: Category[] = ["movie", "music", "book"];

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // Onboarding gate: ensure username exists
  const userId = await requireUserId();
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.username) redirect("/onboarding");

  const { category } = await params;
  const typed = category as Category;
  if (!valid.includes(typed)) return notFound();

  // Only current year is supported in UI; onboarding check happens in create flow

  const title =
    typed === "movie"
      ? "영화 등록"
      : typed === "music"
      ? "음악 등록"
      : "책 등록";

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
        <CreateCategoryTabs />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        검색으로 항목을 선택하고, 메모만 입력해 저장하세요. 순위는 자동
        배정됩니다.
      </p>
      <CreateEntryForm category={typed} />
    </div>
  );
}
