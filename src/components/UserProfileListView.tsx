"use client";

import { ExternalLink } from "lucide-react";

type Item = {
  id: string;
  rank: number;
  media: { title: string; image_url: string | null; link_url?: string | null };
};

type Props = {
  items: Item[];
};

export default function UserProfileListView({ items }: Props) {
  const handleItemClick = (linkUrl: string | null | undefined) => {
    if (linkUrl) {
      window.open(linkUrl, "_blank");
    }
  };

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div
          key={it.id}
          className={`flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 ${
            it.media.link_url ? "cursor-pointer hover:bg-accent" : ""
          }`}
          onClick={() => handleItemClick(it.media.link_url)}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
            {it.rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-foreground truncate">
              {it.media.title}
            </div>
          </div>

          {it.media.link_url && (
            <div className="flex-shrink-0">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
