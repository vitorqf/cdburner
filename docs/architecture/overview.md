# System Overview

## Goal

A self-hosted web app where you build a tracklist, and the homelab burns it to a physical CD.
No cloud dependencies at runtime. Runs entirely on the homelab LAN.

## Component Diagram

```
Browser (React SPA)
        │  HTTP / SSE
        ▼
FastAPI Backend
    ├── Track API      → manages uploads, YouTube downloads
    ├── Disc API       → manages disc projects and tracklists
    └── Burn API       → manages the burn queue and job status
        │
        ├── yt-dlp     → downloads audio from YouTube
        ├── ffmpeg     → converts audio to CDDA WAV or normalizes MP3
        ├── wodim      → burns the disc (calls /dev/sr0 on host)
        │
        └── SQLite DB  → persists tracks, discs, burn jobs
                │
Storage (bind mount)
    ├── uploads/       → original files from uploads or yt-dlp
    ├── converted/     → CDDA WAV files ready for burning
    └── temp/          → scratch space during processing
```

## Request Flows

### Upload a track
1. Browser POSTs multipart file to `POST /api/tracks/upload`
2. Backend saves file to `storage/uploads/`
3. Background task runs ffmpeg to extract duration and convert to WAV → `storage/converted/`
4. Track status transitions: `pending → ready`
5. Frontend polls `GET /api/tracks/{id}` until ready

### Import from YouTube
1. Browser POSTs URL to `POST /api/tracks/youtube`
2. Backend queues a background task: yt-dlp downloads audio → `storage/uploads/`
3. ffmpeg converts to WAV → `storage/converted/`
4. Track status: `pending → downloading → ready | error`
5. Frontend receives live updates via SSE on `GET /api/tracks/{id}/status`

### Burn a disc
1. Browser POSTs `POST /api/burn/{disc_id}`
2. Backend validates: all tracks must be `ready`, disc not empty
3. BurnJob created with status `queued`
4. Burn worker picks up job (one at a time)
5. If a job is already in progress → worker waits
6. Before starting: emits a `insert_disc` event → frontend shows "Insert disc and confirm" prompt
7. User confirms → `PATCH /api/burn/{job_id}/confirm`
8. wodim executes, progress streamed via SSE
9. Job finishes → status `done | error`

## Concurrency Model

- One burn job runs at a time (the physical drive constraint).
- Track downloads and conversions run as asyncio background tasks — multiple can run concurrently.
- Burn queue is in-process (asyncio Queue). No Redis or Celery needed for a single-user homelab.
