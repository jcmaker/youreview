import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import ClientForm from "./ClientForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 설정 - youreview",
  description:
    "youreview 시작을 위한 사용자명을 설정하세요. 3~20자 영문/숫자로 구성된 고유한 닉네임을 만들어 공개 프로필 주소로 사용할 수 있습니다.",
  keywords: [
    "프로필 설정",
    "사용자명",
    "닉네임",
    "프로필 주소",
    "youreview 시작",
  ],
  robots: "noindex, nofollow",
};

export default async function Page() {
  const userId = await requireUserId();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const existing = (data?.username as string | null) ?? null;
  if (existing) redirect("/create/movie");
  return <ClientForm />;
}
