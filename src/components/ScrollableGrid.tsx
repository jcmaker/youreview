"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  rank: number;
  media: { title: string; image_url: string | null; link_url?: string | null };
};

interface ScrollableGridProps {
  items: Item[];
  category: "movie" | "music" | "book";
}

export default function ScrollableGrid({
  items,
  category,
}: ScrollableGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = direction === "left" ? -400 : 400;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // 모바일에서는 더 작은 크기로 설정
  const cardWidth = category === "music" ? 160 : 120;
  const cardHeight = category === "music" ? 160 : 180;

  return (
    <div className="relative group">
      {/* Left scroll button - PC only */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 hidden md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Right scroll button - PC only */}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 hidden md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-4 pb-4 min-w-max">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <div
                className={`w-full overflow-hidden bg-muted ${
                  category === "music" ? "aspect-square" : "aspect-[2/3]"
                }`}
              >
                {item.media.image_url ? (
                  <Image
                    src={item.media.image_url}
                    alt={item.media.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    width={cardWidth}
                    height={cardHeight}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    no image
                  </div>
                )}
              </div>

              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 text-xs font-semibold bg-foreground/80 text-background px-1 sm:px-1.5 py-0.5 rounded">
                #{item.rank}
              </div>

              <div className="p-2 sm:p-3">
                <div className="text-xs sm:text-sm font-medium line-clamp-2 text-foreground max-w-[120px] sm:max-w-[140px]">
                  {item.media.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `,
        }}
      />
    </div>
  );
}
