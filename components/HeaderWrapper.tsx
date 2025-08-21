"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  // 마이페이지 경로(/u/[username])일 때는 헤더를 숨김
  const isUserProfilePage = pathname?.startsWith("/u/");

  if (isUserProfilePage) {
    return null;
  }

  return <Header />;
}
