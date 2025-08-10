import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import type { Metadata } from "next";

type Item = {
  id: string;
  rank: number;
  media: { title: string; image_url: string | null };
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const uname = (username || "").toLowerCase();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, username")
    .ilike("username", uname)
    .maybeSingle();
  if (!profile) return notFound();

  const year = new Date().getFullYear();
  const { data: lists } = await supabaseAdmin
    .from("top10_lists")
    .select("id, category")
    .eq("user_id", profile.id)
    .eq("year", year)
    .eq("visibility", "public")
    .gt("item_count", 0);

  const sections = await Promise.all(
    (lists ?? []).map(async (l) => {
      const { data: items } = await supabaseAdmin
        .from("top10_items")
        .select(`id, rank, media:media_id ( title, image_url )`)
        .eq("list_id", l.id)
        .order("rank", { ascending: true });
      return {
        category: l.category as "movie" | "music" | "book",
        items: (items ?? []) as Item[],
      };
    })
  );

  const title = `${profile.display_name || profile.username} — ${year} Top 10`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {sections.map((s) => (
        <div key={s.category} className="space-y-2">
          <div className="text-lg font-medium">
            {s.category === "movie"
              ? "🎬 영화"
              : s.category === "music"
              ? "🎵 음악"
              : "📚 책"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {s.items.map((it) => (
              <div
                key={it.id}
                className="relative rounded overflow-hidden border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.media.image_url ? (
                  <img
                    src={it.media.image_url}
                    alt={it.media.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    no image
                  </div>
                )}
                <div className="absolute top-1 left-1 text-xs font-semibold bg-black/70 text-white px-1.5 py-0.5 rounded">
                  #{it.rank}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const uname = (username || "").toLowerCase();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name, username")
    .ilike("username", uname)
    .maybeSingle();
  const year = new Date().getFullYear();
  const title = profile
    ? `${profile.display_name || profile.username} — ${year} Top 10`
    : `${year} Top 10`;
  const description = `${year}년 공개 Top 10`; // default fallback
  return {
    title,
    description,
  };
}
