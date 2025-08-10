"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState, useTransition } from "react";
import { fetchJson } from "@/lib/http/fetchJson";

type BoardEntry = {
  id: string;
  rank: number;
  media: {
    title: string;
    creators: string[] | null;
    imageUrl: string | null;
    category: "movie" | "music" | "book";
  };
};

function SortableCard({
  entry,
  rank,
  allowDrag,
}: {
  entry: BoardEntry;
  rank: number;
  allowDrag: boolean;
}) {
  const id = entry.id;
  const disabled = !allowDrag;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      aria-disabled={disabled}
      className={`border rounded p-3 bg-white shadow-sm flex items-center gap-3 ${
        disabled ? "opacity-60 cursor-default" : "cursor-grab"
      }`}
    >
      <div className="w-10 text-lg font-bold text-gray-500">{rank}</div>
      <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {entry.media.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.media.imageUrl}
            alt={entry.media.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs text-gray-400">no image</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{entry.media.title}</div>
        {entry.media.creators?.length ? (
          <div className="text-xs text-gray-500 truncate">
            {entry.media.creators.join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Top10Board({
  initialEntries,
  listId,
  allowDrag = true,
}: {
  initialEntries: BoardEntry[];
  listId: string;
  allowDrag?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Hooks cannot be called conditionally; build sensors always and ignore when not used
  const pointer = useSensor(PointerSensor);
  const touch = useSensor(TouchSensor, {
    pressDelay: 150,
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(pointer, touch);

  const [items, setItems] = useState<BoardEntry[]>(
    [...initialEntries].sort((a, b) => a.rank - b.rank)
  );
  const [isPending, startTransition] = useTransition();

  const ids = useMemo<UniqueIdentifier[]>(
    () => items.map((e) => e.id),
    [items]
  );

  function toPayload(updated: BoardEntry[]) {
    return updated.map((entry, idx) => ({ id: entry.id, rank: idx + 1 }));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!allowDrag) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const payload = toPayload(newItems);
    startTransition(async () => {
      try {
        await fetchJson("/api/top10/reorder", {
          method: "POST",
          body: JSON.stringify({
            listId,
            entries: payload,
          }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Reorder failed", e);
      }
    });
  }

  // Sync items when initialEntries changes (e.g., category tab switch)
  useEffect(() => {
    setItems([...initialEntries].sort((a, b) => a.rank - b.rank));
  }, [initialEntries]);

  return (
    <div>
      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="grid gap-2">
              {items.map((entry, idx) => (
                <SortableCard
                  key={ids[idx]}
                  entry={entry}
                  rank={idx + 1}
                  allowDrag={allowDrag}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-2">
          {items.map((entry, idx) => (
            <div
              key={entry.id}
              className="border rounded p-3 bg-white shadow-sm flex items-center gap-3"
            >
              <div className="w-10 text-lg font-bold text-gray-500">
                {idx + 1}
              </div>
              <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {entry.media.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.media.imageUrl}
                    alt={entry.media.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400">no image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{entry.media.title}</div>
                {entry.media.creators?.length ? (
                  <div className="text-xs text-gray-500 truncate">
                    {entry.media.creators.join(", ")}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      {mounted && isPending && allowDrag && (
        <div className="text-sm text-gray-500 mt-2">저장 중…</div>
      )}
    </div>
  );
}
