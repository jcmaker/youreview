import Link from "next/link";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 10 항목 등록 - youreview",
  description:
    "영화, 음악, 책을 검색하고 나만의 Top 10 리스트에 추가하세요. 카테고리를 선택하여 항목을 등록할 수 있습니다.",
  keywords: ["Top 10", "항목 등록", "영화", "음악", "책", "검색", "리스트"],
  openGraph: {
    title: "Top 10 항목 등록 - youreview",
    description: "영화, 음악, 책을 검색하고 나만의 Top 10 리스트에 추가하세요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top 10 항목 등록 - youreview",
    description: "영화, 음악, 책을 검색하고 나만의 Top 10 리스트에 추가하세요.",
  },
};

export default async function Page() {
  const userId = await requireUserId();
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.username) redirect("/onboarding");
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Top 10 항목 등록</h1>
      <p className="text-sm text-gray-600">카테고리를 선택하세요.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/create/movie"
          className="border rounded p-4 hover:bg-gray-50"
        >
          영화 등록
        </Link>
        <Link
          href="/create/music"
          className="border rounded p-4 hover:bg-gray-50"
        >
          음악 등록
        </Link>
        <Link
          href="/create/book"
          className="border rounded p-4 hover:bg-gray-50"
        >
          책 등록
        </Link>
      </div>
    </div>
  );
}
