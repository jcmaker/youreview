"use client";

export function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-card">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? (
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      ) : null}
    </div>
  );
}

export function ThumbGrid({
  images,
}: {
  images: (string | null | undefined)[];
}) {
  const list = images.filter(Boolean) as string[];
  return (
    <div className="grid grid-cols-5 gap-2">
      {list.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`thumb-${i}`}
          className="w-full aspect-square object-cover rounded-lg border"
        />
      ))}
      {list.length === 0 && (
        <div className="text-sm text-muted-foreground col-span-5">
          이미지가 없습니다.
        </div>
      )}
    </div>
  );
}
