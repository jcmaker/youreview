"use client";

import { useEffect } from "react";

interface ImagePreloaderProps {
  images: string[];
  category: "movie" | "music" | "book";
}

export default function ImagePreloader({
  images,
  category,
}: ImagePreloaderProps) {
  useEffect(() => {
    // 상위 3개 이미지만 우선 프리로드
    const priorityImages = images.slice(0, 3).filter(Boolean);

    priorityImages.forEach((imageUrl) => {
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.loading = "eager";
      }
    });
  }, [images, category]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
