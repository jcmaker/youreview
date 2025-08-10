import { notFound, redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import type { Category } from "@/types/media";
import CreateEntryForm from "@/components/CreateEntryForm";

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-sm text-gray-600 mb-6">
        검색으로 항목을 선택하고, 메모만 입력해 저장하세요. 순위는 자동 배정됩니다.
      </p>
      <CreateEntryForm category={typed} />
    </div>
  );
}
