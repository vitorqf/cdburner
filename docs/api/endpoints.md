# API Endpoint Reference

Base URL: `http://<homelab-ip>:8000/api`

All responses are JSON. Errors follow: `{ "detail": "message" }`.

---

## Tracks

### `POST /tracks/upload`
Upload one or more audio files.
- Body: `multipart/form-data`, field `files[]`
- Response: `Track[]`

### `POST /tracks/youtube`
Import a YouTube video or playlist.
- Body: `{ "url": "https://youtube.com/..." }`
- Response: `Track[]` (one per video)

### `GET /tracks`
List all tracks in the library.
- Query: `?status=ready` (optional filter)
- Response: `Track[]`

### `GET /tracks/{id}`
Get a single track.
- Response: `Track`

### `GET /tracks/{id}/status` (SSE)
Server-Sent Events stream. Emits `{ "status": "...", "progress": 0-100 }` during download/conversion.
Closes when status reaches `ready` or `error`.

### `DELETE /tracks/{id}`
Delete a track and remove it from all discs.

---

## Discs

### `POST /discs`
Create a new disc project.
- Body: `{ "name": "Summer Mix", "format": "audio", "capacity_seconds": 4440 }`
- Response: `Disc`

### `GET /discs`
List all discs.
- Response: `Disc[]`

### `GET /discs/{id}`
Get a disc with its full tracklist.
- Response: `Disc` (with nested `tracks: DiscTrack[]`)

### `PATCH /discs/{id}`
Update disc name or cover (metadata only, not format).
- Body: `{ "name": "New Name" }`
- Response: `Disc`

### `DELETE /discs/{id}`
Delete a disc and all its DiscTrack rows.

### `POST /discs/{id}/tracks`
Add a track to the disc.
- Body: `{ "track_id": "uuid", "position": 3 }`
- Response: `DiscTrack`

### `PATCH /discs/{id}/tracks/{disc_track_id}`
Update track position (reorder).
- Body: `{ "position": 2 }`
- Response: `DiscTrack`

### `DELETE /discs/{id}/tracks/{disc_track_id}`
Remove a track from the disc.

### `POST /discs/{id}/cover`
Upload album cover image.
- Body: `multipart/form-data`, field `file`
- Response: `Disc`

### `DELETE /discs/{id}/cover`
Remove album cover.

---

## Burn

### `POST /burn/{disc_id}`
Queue a burn job for a disc.
- Response: `BurnJob`

### `GET /burn`
List all burn jobs.
- Response: `BurnJob[]`

### `GET /burn/{job_id}`
Get a burn job.
- Response: `BurnJob`

### `GET /burn/{job_id}/status` (SSE)
Live burn progress. Emits `{ "status": "...", "progress": 0-100, "log": "..." }`.

### `PATCH /burn/{job_id}/confirm`
Confirm disc has been inserted. Moves job from `awaiting_disc` → `burning`.
- Response: `BurnJob`

### `DELETE /burn/{job_id}`
Cancel a queued job (only allowed when status is `queued`).

---

## Types

```typescript
Track {
  id: string
  title: string
  artist: string | null
  album: string | null
  duration_seconds: number | null
  source: "upload" | "youtube"
  source_url: string | null
  status: "pending" | "downloading" | "ready" | "error"
  error_message: string | null
  file_size_bytes: number | null
  created_at: string
}

Disc {
  id: string
  name: string
  format: "audio" | "mp3"
  capacity_seconds: number  // only relevant for audio format
  cover_image_path: string | null
  tracks: DiscTrack[]
  created_at: string
  updated_at: string
}

DiscTrack {
  id: string
  disc_id: string
  track_id: string
  position: number
  track: Track
}

BurnJob {
  id: string
  disc_id: string
  status: "queued" | "awaiting_disc" | "burning" | "done" | "error"
  progress_percent: number
  log_output: string | null
  error_message: string | null
  created_at: string
  finished_at: string | null
}
```
