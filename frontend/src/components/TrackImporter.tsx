import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Youtube, Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { cn, formatDuration } from "@/lib/utils";

interface Props {
  discId: string;
  existingTrackIds: string[];
  nextPosition: number;
  onAdded: () => void;
}

export function TrackImporter({
  discId,
  existingTrackIds,
  nextPosition,
  onAdded,
}: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"library" | "upload" | "youtube">("library");
  const [ytUrl, setYtUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: library } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => api.tracks.list("ready"),
  });

  const addToDisc = useMutation({
    mutationFn: ({ trackId, pos }: { trackId: string; pos: number }) =>
      api.discs.addTrack(discId, trackId, pos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] });
      onAdded();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.tracks.upload(files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tracks"] }),
  });

  const ytMutation = useMutation({
    mutationFn: () => api.tracks.importYoutube(ytUrl.trim()),
    onSuccess: () => {
      setYtUrl("");
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
  });

  const available =
    library?.filter((t) => !existingTrackIds.includes(t.id)) ?? [];

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-cream">
      <div className="flex border-b border-border">
        {(["library", "upload", "youtube"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 min-h-11 text-xs font-medium capitalize transition-colors",
              tab === t
                ? "bg-sage text-primary-fg"
                : "text-ink-secondary hover:bg-cream-mid",
            )}
          >
            {t === "youtube"
              ? "YouTube"
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "library" && (
          <div>
            {available.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-4">
                No ready tracks in library — upload or import some first
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {available.map((track, i) => (
                  <button
                    key={track.id}
                    onClick={() =>
                      addToDisc.mutate({
                        trackId: track.id,
                        pos: nextPosition + i,
                      })
                    }
                    className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-sage-surface text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink truncate">
                        {track.title}
                      </div>
                      {track.artist && (
                        <div className="text-xs text-ink-muted truncate">
                          {track.artist}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted shrink-0">
                      {track.duration_seconds
                        ? formatDuration(track.duration_seconds)
                        : "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "upload" && (
          <div>
            <input
              type="file"
              ref={fileRef}
              multiple
              accept=".mp3,.flac,.wav,.m4a,.aac,.ogg"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) uploadMutation.mutate(files);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-border rounded hover:border-sage transition-colors"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={24} className="animate-spin text-sage" />
              ) : (
                <Upload size={24} className="text-sage-muted" />
              )}
              <span className="text-sm text-ink-muted">
                {uploadMutation.isPending
                  ? "Uploading..."
                  : "Click to upload files"}
              </span>
              <span className="text-xs text-ink-muted">
                MP3, FLAC, WAV, M4A, AAC, OGG
              </span>
            </button>
          </div>
        )}

        {tab === "youtube" && (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-border rounded px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ytUrl.trim()) ytMutation.mutate();
              }}
            />
            <button
              onClick={() => ytMutation.mutate()}
              disabled={!ytUrl.trim() || ytMutation.isPending}
              className="flex items-center gap-1.5 bg-sage text-primary-fg px-3 py-2 rounded text-sm disabled:opacity-40 transition-opacity"
            >
              {ytMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Youtube size={14} />
              )}
              Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
