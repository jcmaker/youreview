import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 - youreview",
  description:
    "youreview에 가입하여 영화, 음악, 책의 Top 10 리스트를 만들고 공유하세요. 무료로 시작하고 연말에는 카드로 공유할 수 있습니다.",
  keywords: [
    "회원가입",
    "youreview",
    "Top 10",
    "영화",
    "음악",
    "책",
    "무료",
    "공유",
  ],
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
