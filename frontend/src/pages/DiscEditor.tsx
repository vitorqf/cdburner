import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Flame,
  Disc3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/api/client";
import { cn, formatDuration } from "@/lib/utils";
import { CapacityBar } from "@/components/CapacityBar";
import { TrackImporter } from "@/components/TrackImporter";
import type { DiscTrack } from "@/types";

function SortableTrackRow({
  dt,
  discId: _discId,
  onRemove,
}: {
  dt: DiscTrack;
  discId: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dt.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 py-3 border-b border-border last:border-0",
        isDragging && "opacity-50",
      )}
    >
      <button
        aria-label="Drag to reorder"
        className="text-ink-muted cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>
      <span className="text-xs text-ink-muted w-5 text-right shrink-0">
        {dt.position}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">
          {dt.track.title}
        </div>
        {dt.track.artist && (
          <div className="text-xs text-ink-muted truncate">
            {dt.track.artist}
          </div>
        )}
      </div>
      <div className="text-xs text-ink-muted shrink-0">
        {dt.track.status === "ready" ? (
          dt.track.duration_seconds ? (
            formatDuration(dt.track.duration_seconds)
          ) : (
            "—"
          )
        ) : dt.track.status === "error" ? (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle size={11} /> Error
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Loader2 size={11} className="animate-spin" /> Processing
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove track"
        className="text-ink-muted hover:text-destructive transition-colors shrink-0"
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function DiscEditor() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [showImporter, setShowImporter] = useState(false);

  const { data: disc, isLoading } = useQuery({
    queryKey: ["disc", id],
    queryFn: () => api.discs.get(id!),
    refetchInterval: (q) => {
      const hasProcessing = q.state.data?.tracks.some(
        (dt) =>
          dt.track.status === "pending" || dt.track.status === "downloading",
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const removeTrack = useMutation({
    mutationFn: (dtId: string) => api.discs.removeTrack(id!, dtId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disc", id] }),
  });

  const reorder = useMutation({
    mutationFn: ({ dtId, position }: { dtId: string; position: number }) =>
      api.discs.reorderTrack(id!, dtId, position),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disc", id] }),
  });

  const queueBurn = useMutation({
    mutationFn: () => api.burn.queue(id!),
    onSuccess: () => nav("/burn"),
  });

  const uploadCover = useMutation({
    mutationFn: (file: File) => api.discs.uploadCover(id!, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disc", id] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !disc) return;

    const oldIndex = disc.tracks.findIndex((dt) => dt.id === active.id);
    const newIndex = disc.tracks.findIndex((dt) => dt.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    reorder.mutate({ dtId: active.id as string, position: newIndex + 1 });
  }

  if (isLoading || !disc) {
    return <p className="text-ink-muted text-sm">Loading...</p>;
  }

  const allReady =
    disc.tracks.length > 0 &&
    disc.tracks.every((dt) => dt.track.status === "ready");
  const totalSeconds = useMemo(
    () =>
      disc.tracks.reduce(
        (acc, dt) => acc + (dt.track.duration_seconds ?? 0),
        0,
      ),
    [disc.tracks],
  );
  const totalBytes = useMemo(
    () =>
      disc.tracks.reduce((acc, dt) => acc + (dt.track.file_size_bytes ?? 0), 0),
    [disc.tracks],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-start gap-6 mb-8">
        <label className="cursor-pointer shrink-0">
          <span className="sr-only">Upload cover image</span>
          <div className="w-24 h-24 rounded bg-sage-surface flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
            {disc.cover_image_path ? (
              <img
                src={`/storage/uploads/covers/${disc.id}.jpg`}
                alt={disc.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc3 size={32} className="text-sage-muted" />
            )}
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCover.mutate(file);
            }}
          />
        </label>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl text-ink">{disc.name}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {disc.format === "audio" ? "Audio CD" : "MP3 disc"} ·{" "}
            {disc.tracks.length} track{disc.tracks.length !== 1 ? "s" : ""}
          </p>
          <CapacityBar
            disc={disc}
            totalSeconds={totalSeconds}
            totalBytes={totalBytes}
          />
        </div>
        <button
          onClick={() => queueBurn.mutate()}
          disabled={!allReady || queueBurn.isPending}
          className="flex items-center gap-2 bg-sage text-primary-fg px-4 py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
        >
          <Flame size={15} />
          Burn
        </button>
      </div>

      {/* Track list */}
      <div className="bg-cream rounded-lg border border-border px-4">
        {disc.tracks.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <p className="text-sm">No tracks yet — add some below</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={disc.tracks.map((dt) => dt.id)}
              strategy={verticalListSortingStrategy}
            >
              {disc.tracks.map((dt) => (
                <SortableTrackRow
                  key={dt.id}
                  dt={dt}
                  discId={disc.id}
                  onRemove={() => removeTrack.mutate(dt.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Import panel */}
      <div className="mt-4">
        <button
          onClick={() => setShowImporter((v) => !v)}
          className="text-sm text-sage font-medium hover:underline"
        >
          {showImporter ? "Close importer" : "+ Add tracks"}
        </button>
        {showImporter && (
          <TrackImporter
            discId={disc.id}
            existingTrackIds={disc.tracks.map((dt) => dt.track_id)}
            nextPosition={disc.tracks.length + 1}
            onAdded={() => qc.invalidateQueries({ queryKey: ["disc", id] })}
          />
        )}
      </div>
    </div>
  );
}
