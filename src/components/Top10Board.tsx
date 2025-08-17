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
  DragStartEvent,
  DragOverlay,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, GripVertical } from "lucide-react";

type BoardEntry = {
  id: string;
  rank: number;
  userNote: string | null;
  userLink: string | null;
  media: {
    title: string;
    creators: string[] | null;
    imageUrl: string | null;
    category: "movie" | "music" | "book";
  };
};

function SortableCard({
  entry,
  displayRank,
  allowDrag,
  allowEdit,
  onEdit,
}: // onDelete,
{
  entry: BoardEntry;
  displayRank: number;
  allowDrag: boolean;
  allowEdit: boolean;
  onEdit: (entry: BoardEntry) => void;
  // onDelete: (entry: BoardEntry) => void;
}) {
  const id = entry.id;
  const disabled = !allowDrag;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  // 모바일에서만 드래그 핸들 사용
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled || isMobile ? {} : listeners)}
      aria-disabled={disabled}
      className={`group border-2 rounded-xl md:p-2 p-1 pl-0 bg-card shadow-md hover:shadow-lg flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 ${
        disabled
          ? "opacity-60 cursor-default"
          : isMobile
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing"
      } ${
        isDragging
          ? "shadow-2xl scale-[1.02] z-10 border-primary rotate-1 bg-accent/20"
          : "border-border"
      } transition-all duration-300 ease-out`}
    >
      {/* Rank badge - 모바일에서는 간단한 텍스트, PC에서는 원형 */}
      <div className="hidden sm:flex w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-foreground items-center justify-center font-bold text-sm lg:text-base text-background border border-border">
        #{displayRank}
      </div>
      {/* Drag Handle - 모바일에서만 표시 */}
      {allowDrag && (
        <div
          className="sm:hidden flex items-center justify-center p-1 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors"
          {...(isMobile ? listeners : {})}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-center gap-2 flex-1">
        {/* Thumbnail - 모바일에서는 숨김 */}
        <div className="hidden sm:block w-16 lg:w-20 aspect-video rounded-lg overflow-hidden md:flex items-center justify-center flex-shrink-0 border border-border shadow-sm bg-muted">
          {entry.media.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.media.imageUrl}
              alt={entry.media.title}
              loading="lazy"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xs text-muted-foreground">no image</span>
          )}
        </div>

        {/* Texts */}
        <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-[250px] lg:max-w-[300px]">
          <div className="font-semibold truncate text-sm sm:text-sm lg:text-base text-foreground">
            {entry.media.title}
          </div>
          {entry.media.creators?.length ? (
            <div className="text-xs text-muted-foreground truncate">
              {entry.media.creators.join(", ")}
            </div>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      {allowEdit && (
        <div className=" md:group-hover:opacity-100 transition-opacity flex items-center gap-1 sm:gap-2 flex-shrink-0 md:opacity-0">
          {/* PC에서는 개별 버튼 */}
          <div className="md:flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors duration-200 shadow-sm"
              title="편집"
            >
              <Edit className="w-4 h-4" />
            </button>
            {/* <button
              type="button"
              onClick={() => onDelete(entry)}
              className="p-2 rounded-lg border border-foreground hover:bg-accent text-foreground transition-colors duration-200 shadow-sm"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button> */}
          </div>

          {/* 모바일에서는 편집 버튼만 표시 */}
          {/* <Button
            type="button"
            onClick={() => onEdit(entry)}
            className="md:hidden p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground "
            title="편집"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button> */}
        </div>
      )}
    </div>
  );
}

function DragOverlayCard({
  entry,
  displayRank,
}: {
  entry: BoardEntry;
  displayRank: number;
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div
      className={`border-2 rounded-xl p-2 sm:p-3 lg:p-4 bg-card shadow-2xl flex items-center gap-2 sm:gap-3 lg:gap-4 border-primary ${
        isMobile ? "scale-[1.05] rotate-2" : "scale-[1.02] rotate-1"
      }`}
    >
      {/* Rank badge - 모바일에서는 간단한 텍스트, PC에서는 원형 */}
      <div className="hidden sm:flex w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-accent items-center justify-center font-bold text-sm lg:text-base text-accent-foreground border border-border">
        #{displayRank}
      </div>
      <div className="sm:hidden text-xs font-bold text-accent-foreground bg-accent px-2 py-1 rounded">
        #{displayRank}
      </div>

      {/* Thumbnail - 모바일에서는 숨김 */}
      <div className="hidden sm:block w-16 lg:w-20 aspect-video rounded-lg overflow-hidden md:flex items-center justify-center flex-shrink-0 border border-border shadow-sm bg-muted">
        {entry.media.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.media.imageUrl}
            alt={entry.media.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs text-muted-foreground">no image</span>
        )}
      </div>
      <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-[250px] lg:max-w-[300px]">
        <div className="font-semibold truncate text-sm sm:text-sm lg:text-base text-foreground">
          {entry.media.title}
        </div>
        {entry.media.creators?.length ? (
          <div className="text-xs text-muted-foreground truncate">
            {entry.media.creators.join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Top10Skeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 10 }).map((_, idx) => (
        <div
          key={idx}
          className="border-2 rounded-xl p-4 bg-card shadow-md flex items-center gap-3 sm:gap-4 border-border"
        >
          <Skeleton className="w-10 sm:w-12 h-10 sm:h-12 rounded-full" />
          <Skeleton className="w-16 sm:w-20 aspect-video rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 sm:h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Top10Board({
  initialEntries,
  listId,
  allowDrag = true,
  allowEdit = true,
}: {
  initialEntries: BoardEntry[];
  listId: string;
  allowDrag?: boolean;
  allowEdit?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 센서 설정 - 모바일 드래그 개선
  const pointer = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touch = useSensor(TouchSensor, {
    pressDelay: 50, // 더 빠른 반응
    activationConstraint: { distance: 5, tolerance: 10 }, // 더 관대한 제약
  });
  const sensors = useSensors(pointer, touch);

  const [items, setItems] = useState<BoardEntry[]>(
    [...initialEntries].sort((a, b) => a.rank - b.rank)
  );
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<BoardEntry | null>(null);
  const [deleting, setDeleting] = useState<BoardEntry | null>(null);
  const [editNote, setEditNote] = useState<string>("");
  // const [editLink, setEditLink] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const ids = useMemo<UniqueIdentifier[]>(
    () => items.map((e) => e.id),
    [items]
  );

  const activeEntry = useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items]
  );

  function toPayload(updated: BoardEntry[]) {
    return updated.map((entry, idx) => ({ id: entry.id, rank: idx + 1 }));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);

    // 모바일에서 드래그 시작 시 페이지 스크롤 방지
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!allowDrag) return;
    const { active, over } = event;
    setActiveId(null);

    // 모바일에서 드래그 종료 시 페이지 스크롤 복원
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex !== newIndex) {
      const newItems = arrayMove(items, oldIndex, newIndex).map((e, idx) => ({
        ...e,
        rank: idx + 1,
      }));
      setItems(newItems);

      const payload = toPayload(newItems);
      startTransition(async () => {
        try {
          await fetchJson("/api/top10/reorder", {
            method: "POST",
            body: JSON.stringify({ listId, entries: payload }),
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Reorder failed", e);
        }
      });
    }
  }

  // Sync on prop change
  useEffect(() => {
    setItems([...initialEntries].sort((a, b) => a.rank - b.rank));
  }, [initialEntries]);

  function openEdit(entry: BoardEntry) {
    if (!allowEdit) return;
    setEditing(entry);
    setEditNote(entry.userNote ?? "");
    // setEditLink(entry.userLink ?? "");
    setToast("");
  }

  function openDelete(entry: BoardEntry) {
    if (!allowEdit) return;
    setDeleting(entry);
    setToast("");
  }

  async function onConfirmEdit() {
    if (!editing) return;
    startTransition(async () => {
      try {
        const { updateItem } = await import("@/app/actions/updateItem");
        await updateItem({
          itemId: editing.id,
          userNote: editNote.trim() || null,
          userLink: editing.userLink, // 기존 링크 유지
        });
        setToast("저장되었습니다");
        setEditing(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "실패";
        setToast(`에러: ${msg}`);
      }
    });
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      try {
        const { deleteItem } = await import("@/app/actions/deleteItem");
        await deleteItem({ itemId: deleting.id });
        setItems((prev) => prev.filter((e) => e.id !== deleting.id));
        setDeleting(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "실패";
        setToast(`에러: ${msg}`);
      }
    });
  }

  if (!mounted) {
    return <Top10Skeleton />;
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="grid gap-3">
            {items.map((entry, idx) => (
              <SortableCard
                key={ids[idx]}
                entry={entry}
                displayRank={entry.rank}
                allowDrag={allowDrag}
                allowEdit={allowEdit}
                onEdit={openEdit}
                // onDelete={openDelete}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeEntry ? (
            <>
              {/* 모바일에서 드래그 중일 때 전체 화면 오버레이 */}
              {typeof window !== "undefined" && window.innerWidth < 640 && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 pointer-events-none" />
              )}
              <DragOverlayCard
                entry={activeEntry}
                displayRank={activeEntry.rank}
              />
            </>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Reorder pending */}
      {isPending && allowDrag && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-accent rounded-lg border border-primary">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-accent-foreground font-medium">
            저장 중…
          </span>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="mt-4 p-3 bg-accent rounded-lg border border-primary">
          <span className="text-sm text-accent-foreground font-medium">
            {toast}
          </span>
        </div>
      )}

      {/* Edit Modal */}
      {editing && allowEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setEditing(null)}
            aria-hidden
          />
          <div className="relative w-full sm:w-[min(520px,92vw)] max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Edit className="w-4 h-4 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">항목 편집</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  메모
                </label>
                <textarea
                  className="w-full border border-border rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="간단한 감상이나 메모를 남겨보세요..."
                />
              </div>
              {/* 링크 입력 필드 숨김 */}
              {/* <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  링크
                </label>
                <input
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="https://..."
                />
              </div> */}
            </div>

            <div className="flex justify-between items-center mt-6">
              {/* 삭제 버튼 - PC와 모바일 모두 표시 */}
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  openDelete(editing);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                삭제
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors text-foreground"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={onConfirmEdit}
                  className="px-4 py-2 text-sm rounded-lg bg-foreground text-background transition-all duration-200 shadow-lg hover:opacity-90"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleting && allowEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setDeleting(null)}
            aria-hidden
          />
          <div className="relative w-full sm:w-[min(420px,92vw)] rounded-2xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                삭제하시겠어요?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors text-foreground"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-foreground text-background transition-all duration-200 shadow-lg hover:opacity-90"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
