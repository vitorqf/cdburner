import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Disc3 } from "lucide-react";
import { api } from "@/api/client";
import { cn, formatDuration } from "@/lib/utils";
import type { Disc } from "@/types";

function NewDiscModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"audio" | "mp3">("audio");
  const [capacity, setCapacity] = useState(74 * 60);

  const create = useMutation({
    mutationFn: () =>
      api.discs.create({ name: name.trim(), format, capacity_seconds: capacity }),
    onSuccess: (disc) => {
      qc.invalidateQueries({ queryKey: ["discs"] });
      nav(`/discs/${disc.id}`);
    },
  });

  return (
    <div className="fixed inset-0 bg-ink/30 flex items-center justify-center z-50">
      <div className="bg-cream rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="font-serif text-xl text-ink mb-6">New disc</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-secondary block mb-1">Name</label>
            <input
              className="w-full border border-border rounded px-3 py-2 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Summer Mix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-secondary block mb-2">Format</label>
            <div className="space-y-2">
              {([
                ["audio", "Audio CD", "Plays everywhere — max 74 or 80 min"],
                ["mp3", "MP3 disc", "More songs — compatible players only"],
              ] as const).map(([val, label, desc]) => (
                <label
                  key={val}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors",
                    format === val
                      ? "border-sage bg-sage-surface"
                      : "border-border hover:bg-cream-mid"
                  )}
                >
                  <input
                    type="radio"
                    className="mt-0.5"
                    checked={format === val}
                    onChange={() => setFormat(val)}
                  />
                  <div>
                    <div className="text-sm font-medium text-ink">{label}</div>
                    <div className="text-xs text-ink-muted">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {format === "audio" && (
            <div>
              <label className="text-sm font-medium text-ink-secondary block mb-2">Capacity</label>
              <div className="flex gap-2">
                {[74 * 60, 80 * 60].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setCapacity(cap)}
                    className={cn(
                      "flex-1 py-2 rounded text-sm transition-colors border",
                      capacity === cap
                        ? "bg-sage text-primary-fg border-sage"
                        : "border-border text-ink-secondary hover:bg-cream-mid"
                    )}
                  >
                    {cap / 60} min
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border border-border text-sm text-ink-secondary hover:bg-cream-mid transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => create.mutate()}
            disabled={!name.trim() || create.isPending}
            className="flex-1 py-2 rounded bg-sage text-primary-fg text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Create disc
          </button>
        </div>
      </div>
    </div>
  );
}

function DiscCard({ disc }: { disc: Disc }) {
  const nav = useNavigate();
  const totalSeconds = disc.tracks.reduce(
    (acc, dt) => acc + (dt.track.duration_seconds ?? 0),
    0
  );

  return (
    <button
      onClick={() => nav(`/discs/${disc.id}`)}
      className="group text-left w-full bg-cream border border-border rounded-lg overflow-hidden hover:border-sage-light transition-colors"
    >
      <div className="aspect-square bg-sage-surface flex items-center justify-center">
        {disc.cover_image_path ? (
          <img
            src={`/storage/uploads/covers/${disc.id}.jpg`}
            alt={disc.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Disc3 size={48} className="text-sage-muted" />
        )}
      </div>
      <div className="p-4">
        <div className="font-serif text-base text-ink truncate">{disc.name}</div>
        <div className="text-xs text-ink-muted mt-1">
          {disc.tracks.length} track{disc.tracks.length !== 1 ? "s" : ""} ·{" "}
          {disc.format === "audio" ? formatDuration(totalSeconds) : `${disc.tracks.length} files`}
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const [showNew, setShowNew] = useState(false);
  const { data: discs, isLoading } = useQuery({
    queryKey: ["discs"],
    queryFn: api.discs.list,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-ink">Your discs</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-sage text-primary-fg px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New disc
        </button>
      </div>

      {isLoading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : !discs?.length ? (
        <div className="text-center py-24 text-ink-muted">
          <Disc3 size={40} className="mx-auto mb-4 text-sage-muted" />
          <p className="font-serif text-lg text-ink-secondary">No discs yet</p>
          <p className="text-sm mt-1">Create your first disc to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {discs.map((disc) => (
            <DiscCard key={disc.id} disc={disc} />
          ))}
        </div>
      )}

      {showNew && <NewDiscModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
