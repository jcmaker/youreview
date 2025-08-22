import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 - youreview",
  description:
    "youreview에 로그인하여 영화, 음악, 책의 Top 10 리스트를 만들고 관리하세요. 소셜 로그인으로 간편하게 시작할 수 있습니다.",
  keywords: [
    "로그인",
    "youreview",
    "Top 10",
    "영화",
    "음악",
    "책",
    "소셜 로그인",
  ],
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
