"use client";

import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 - youreview",
  description: "youreview에 로그인하여 나만의 Top 10 리스트를 만들어보세요.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
