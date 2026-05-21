import { cn, formatDuration, formatBytes } from "@/lib/utils";
import type { Disc } from "@/types";

interface Props {
  disc: Disc;
  totalSeconds: number;
  totalBytes: number;
}

export function CapacityBar({ disc, totalSeconds, totalBytes }: Props) {
  if (disc.format === "audio") {
    const capacity = disc.capacity_seconds;
    const pct = Math.min((totalSeconds / capacity) * 100, 100);
    const over = totalSeconds > capacity;

    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-ink-muted mb-1">
          <span>{formatDuration(totalSeconds)}</span>
          <span className={cn(over && "text-destructive font-medium")}>
            {over ? "Over capacity" : `${formatDuration(capacity - totalSeconds)} remaining`}
          </span>
        </div>
        <div className="h-1.5 bg-cream-mid rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              over ? "bg-destructive" : pct > 90 ? "bg-amber-500" : "bg-sage"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-xs text-ink-muted mt-1">{formatDuration(capacity)} total</div>
      </div>
    );
  }

  const capacity = 700 * 1024 * 1024;
  const pct = Math.min((totalBytes / capacity) * 100, 100);
  const over = totalBytes > capacity;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-ink-muted mb-1">
        <span>{formatBytes(totalBytes)}</span>
        <span className={cn(over && "text-destructive font-medium")}>
          {over ? "Over capacity" : `${formatBytes(capacity - totalBytes)} remaining`}
        </span>
      </div>
      <div className="h-1.5 bg-cream-mid rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            over ? "bg-destructive" : pct > 90 ? "bg-amber-500" : "bg-sage"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-ink-muted mt-1">700 MB total</div>
    </div>
  );
}
