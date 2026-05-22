import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Music, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { formatDuration } from "@/lib/utils";
import type { Track } from "@/types";

const STATUS_LABEL: Record<Track["status"], string> = {
  pending: "Processing",
  downloading: "Downloading",
  ready: "Ready",
  error: "Error",
};

function TrackRow({ track }: { track: Track }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: () => api.tracks.delete(track.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tracks"] }),
  });

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{track.title}</div>
        {track.artist && (
          <div className="text-xs text-ink-muted truncate">{track.artist}</div>
        )}
      </div>
      <div className="text-xs text-ink-muted shrink-0">
        {track.duration_seconds ? formatDuration(track.duration_seconds) : "—"}
      </div>
      <div className="shrink-0">
        {track.status === "ready" ? (
          <span className="text-xs text-sage font-medium">Ready</span>
        ) : track.status === "error" ? (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle size={12} />
            {track.error_message ?? "Error"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <Loader2 size={12} className="animate-spin" />
            {STATUS_LABEL[track.status]}
          </span>
        )}
      </div>
      <button
        onClick={() => del.mutate()}
        aria-label={`Delete ${track.title}`}
        className="size-11 flex items-center justify-center text-ink-muted hover:text-destructive transition-colors shrink-0"
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function TrackLibrary() {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => api.tracks.list(),
    refetchInterval: (q) => {
      const hasActive = q.state.data?.some(
        (t) => t.status === "pending" || t.status === "downloading"
      );
      return hasActive ? 2000 : false;
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-8">Track library</h1>

      {isLoading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : !tracks?.length ? (
        <div className="text-center py-24 text-ink-muted">
          <Music size={40} className="mx-auto mb-4 text-sage-muted" />
          <p className="font-serif text-lg text-ink-secondary">No tracks yet</p>
          <p className="text-sm mt-1">Import tracks from a disc editor</p>
        </div>
      ) : (
        <div className="bg-cream rounded-lg border border-border px-4">
          {tracks.map((t) => (
            <TrackRow key={t.id} track={t} />
          ))}
        </div>
      )}
    </div>
  );
}
