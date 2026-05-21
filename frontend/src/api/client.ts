import type { BurnJob, Disc, DiscTrack, Track } from "@/types";

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── Tracks ────────────────────────────────────────────────────────

export const api = {
  tracks: {
    list: (status?: string) =>
      req<Track[]>(`/tracks${status ? `?status=${status}` : ""}`),
    get: (id: string) => req<Track>(`/tracks/${id}`),
    upload: (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return fetch(`${BASE}/tracks/upload`, { method: "POST", body: form }).then(
        (r) => r.json() as Promise<Track[]>
      );
    },
    importYoutube: (url: string) =>
      req<Track[]>("/tracks/youtube", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    delete: (id: string) =>
      fetch(`${BASE}/tracks/${id}`, { method: "DELETE" }),
  },

  // ── Discs ──────────────────────────────────────────────────────

  discs: {
    list: () => req<Disc[]>("/discs"),
    get: (id: string) => req<Disc>(`/discs/${id}`),
    create: (body: { name: string; format: string; capacity_seconds: number }) =>
      req<Disc>("/discs", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, name: string) =>
      req<Disc>(`/discs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      fetch(`${BASE}/discs/${id}`, { method: "DELETE" }),
    addTrack: (discId: string, trackId: string, position: number) =>
      req<DiscTrack>(`/discs/${discId}/tracks`, {
        method: "POST",
        body: JSON.stringify({ track_id: trackId, position }),
      }),
    reorderTrack: (discId: string, dtId: string, position: number) =>
      req<DiscTrack>(`/discs/${discId}/tracks/${dtId}`, {
        method: "PATCH",
        body: JSON.stringify({ position }),
      }),
    removeTrack: (discId: string, dtId: string) =>
      fetch(`${BASE}/discs/${discId}/tracks/${dtId}`, { method: "DELETE" }),
    uploadCover: (discId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return fetch(`${BASE}/discs/${discId}/cover`, { method: "POST", body: form }).then(
        (r) => r.json() as Promise<Disc>
      );
    },
    deleteCover: (discId: string) =>
      req<Disc>(`/discs/${discId}/cover`, { method: "DELETE" }),
  },

  // ── Burn ───────────────────────────────────────────────────────

  burn: {
    queue: (discId: string) =>
      req<BurnJob>(`/burn/${discId}`, { method: "POST" }),
    list: () => req<BurnJob[]>("/burn"),
    get: (jobId: string) => req<BurnJob>(`/burn/${jobId}`),
    confirm: (jobId: string) =>
      req<BurnJob>(`/burn/${jobId}/confirm`, { method: "PATCH" }),
    cancel: (jobId: string) =>
      fetch(`${BASE}/burn/${jobId}`, { method: "DELETE" }),
  },
};
