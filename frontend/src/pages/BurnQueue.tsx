import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, CheckCircle2, XCircle, Loader2, Disc3 } from "lucide-react";
import { api } from "@/api/client";
import type { BurnJob } from "@/types";

function JobCard({ job }: { job: BurnJob }) {
  const qc = useQueryClient();
  const confirm = useMutation({
    mutationFn: () => api.burn.confirm(job.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["burn-jobs"] }),
  });
  const cancel = useMutation({
    mutationFn: () => api.burn.cancel(job.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["burn-jobs"] }),
  });

  return (
    <div className="bg-cream rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {job.status === "done" ? (
            <CheckCircle2 size={16} className="text-sage" />
          ) : job.status === "error" ? (
            <XCircle size={16} className="text-destructive" />
          ) : (
            <Loader2 size={16} className="animate-spin text-sage" />
          )}
          <span className="text-sm font-medium text-ink capitalize">
            {job.status.replace("_", " ")}
          </span>
        </div>
        {job.status === "queued" && (
          <button
            onClick={() => cancel.mutate()}
            className="min-h-11 px-3 text-xs text-ink-muted hover:text-destructive transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {job.status === "burning" && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-ink-muted mb-1">
            <span>Burning</span>
            <span>{job.progress_percent.toFixed(0)}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(job.progress_percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Burn progress"
            className="h-1.5 bg-cream-mid rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-sage transition-all duration-500"
              style={{ width: `${job.progress_percent}%` }}
            />
          </div>
        </div>
      )}

      {job.status === "awaiting_disc" && (
        <div className="mt-3 p-4 bg-sage-surface rounded border border-sage-muted text-center">
          <Disc3 size={28} className="mx-auto mb-2 text-sage" />
          <p className="text-sm text-ink font-medium mb-1">Insert a blank disc</p>
          <p className="text-xs text-ink-muted mb-4">
            Place a blank CD into the drive, then confirm below.
          </p>
          <button
            onClick={() => confirm.mutate()}
            disabled={confirm.isPending}
            className="bg-sage text-primary-fg px-6 min-h-11 rounded text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Confirm — disc is in the drive
          </button>
        </div>
      )}

      {job.status === "error" && job.error_message && (
        <p className="mt-2 text-xs text-destructive">{job.error_message}</p>
      )}

      <p className="text-xs text-ink-muted mt-3">
        Started {new Date(job.created_at).toLocaleString()}
        {job.finished_at && ` · Finished ${new Date(job.finished_at).toLocaleString()}`}
      </p>
    </div>
  );
}

export default function BurnQueue() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["burn-jobs"],
    queryFn: api.burn.list,
    refetchInterval: (q) => {
      const active = q.state.data?.some(
        (j) => j.status === "queued" || j.status === "burning" || j.status === "awaiting_disc"
      );
      return active ? 2000 : false;
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-8">Burn queue</h1>

      {isLoading ? (
        <p className="text-ink-muted text-sm">Loading...</p>
      ) : !jobs?.length ? (
        <div className="text-center py-24 text-ink-muted">
          <Flame size={40} className="mx-auto mb-4 text-sage-muted" />
          <p className="font-serif text-lg text-ink-secondary">Nothing queued</p>
          <p className="text-sm mt-1">Burn a disc from the disc editor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}
    </div>
  );
}
