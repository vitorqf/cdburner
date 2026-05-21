# TODO — CDburner Kanban

> Short-form tracking. One line per item. Move items across columns as work progresses.
> For feature specs, see [features/](features/CLAUDE.md). For why decisions were made, see [decisions/](decisions/CLAUDE.md).

---

## In Progress

_nothing yet_

---

## Backlog

### Infrastructure
- [ ] `docker-compose.yml` — backend + frontend services, storage volume, /dev/sr0 passthrough
- [ ] `backend/Dockerfile` — Python 3.12, ffmpeg, wodim, yt-dlp
- [ ] `frontend/Dockerfile` — Node 20, Vite build
- [ ] `backend/.env.example`
- [ ] Initialize SQLAlchemy models and create_all on startup

### Backend — Tracks
- [ ] `POST /api/tracks/upload` — multipart file upload, save to storage/uploads
- [ ] `POST /api/tracks/youtube` — yt-dlp download as background task
- [ ] `GET /api/tracks` — list all tracks
- [ ] `GET /api/tracks/{id}` — single track
- [ ] `GET /api/tracks/{id}/status` — SSE stream for download/convert progress
- [ ] `DELETE /api/tracks/{id}` — delete + cascade DiscTrack rows
- [ ] ffmpeg service — extract duration, convert to CDDA WAV
- [ ] yt-dlp service — download audio, extract metadata

### Backend — Discs
- [ ] `POST /api/discs` — create disc (name, format, capacity)
- [ ] `GET /api/discs` — list discs
- [ ] `GET /api/discs/{id}` — disc with tracklist
- [ ] `PATCH /api/discs/{id}` — rename
- [ ] `DELETE /api/discs/{id}`
- [ ] `POST /api/discs/{id}/tracks` — add track at position
- [ ] `PATCH /api/discs/{id}/tracks/{dtid}` — reorder
- [ ] `DELETE /api/discs/{id}/tracks/{dtid}` — remove track from disc
- [ ] `POST /api/discs/{id}/cover` — album art upload
- [ ] `DELETE /api/discs/{id}/cover`

### Backend — Burn
- [ ] `POST /api/burn/{disc_id}` — queue burn job
- [ ] `GET /api/burn` — list jobs
- [ ] `GET /api/burn/{job_id}` — single job
- [ ] `GET /api/burn/{job_id}/status` — SSE progress stream
- [ ] `PATCH /api/burn/{job_id}/confirm` — user confirms disc inserted
- [ ] `DELETE /api/burn/{job_id}` — cancel queued job
- [ ] Burn worker — asyncio queue, sequential processing, wodim subprocess

### Frontend
- [ ] Vite + React + TypeScript + Tailwind scaffold
- [ ] API client (fetch wrapper with React Query)
- [ ] Page: Disc list / home
- [ ] Page: Disc editor (tracklist, capacity bar, burn button)
- [ ] Page: Track library
- [ ] Page: Burn status / queue view
- [ ] Component: Track import panel (upload + YouTube URL)
- [ ] Component: Capacity bar (time for Audio CD, MB for MP3)
- [ ] Component: Insert disc confirmation modal
- [ ] Component: Album cover upload
- [ ] Visual design with `/impeccable`

---

## Done

- [x] Brainstorming session — decided stack, features, constraints
- [x] `CLAUDE.md` — root project bible
- [x] `PRODUCT.md` — design strategy, register, principles
- [x] `DESIGN.md` — seed visual system (The Gift Room)
- [x] `docs/` — full second brain scaffold (architecture, features, API, deployment, decisions, TODO)
- [x] `fastapi-python` skill — created (FastAPI patterns, background tasks, SSE, subprocess)
- [x] `docker-compose.yml` — backend + frontend, storage volume, /dev/sr0 passthrough
- [x] `backend/Dockerfile` — Python 3.12, ffmpeg, wodim, yt-dlp
- [x] `frontend/Dockerfile` + `nginx.conf` — Vite build + nginx with SSE-safe proxy
- [x] `backend/.env.example`
- [x] SQLAlchemy models: Track, Disc, DiscTrack, BurnJob
- [x] Pydantic schemas: TrackOut, DiscOut, BurnJobOut + input schemas
- [x] `POST /api/tracks/upload` — multipart, saves to storage, triggers ffmpeg background task
- [x] `POST /api/tracks/youtube` — yt-dlp download as background task
- [x] `GET /api/tracks`, `GET /api/tracks/{id}`, `DELETE /api/tracks/{id}`
- [x] `GET /api/tracks/{id}/status` — SSE stream
- [x] Full `/api/discs` CRUD + track add/reorder/remove + cover upload
- [x] Full `/api/burn` — queue, confirm, SSE progress, cancel
- [x] asyncio burn worker wired into app lifespan
- [x] `services/audio.py` — ffmpeg duration extraction + CDDA WAV conversion
- [x] `services/youtube.py` — yt-dlp download + convert pipeline
- [x] `services/burner.py` — wodim Audio CD + MP3 disc commands + progress parsing
- [x] Frontend scaffold: React 18 + Vite + TypeScript + Tailwind v4
- [x] Design tokens in `index.css` (warm sage palette, cream neutrals, warm darks)
- [x] API client (`src/api/client.ts`) — typed fetch wrappers for all endpoints
- [x] Types (`src/types/index.ts`) — Track, Disc, DiscTrack, BurnJob
- [x] Page: Home — disc grid + new disc modal (format + capacity picker)
- [x] Page: Disc editor — sortable tracklist, capacity bar, burn button, cover upload
- [x] Page: Track library — list with status badges, delete
- [x] Page: Burn queue — insert-disc prompt, progress bar, cancel
- [x] Component: CapacityBar — time (audio) or MB (mp3), warning colors
- [x] Component: TrackImporter — library tab, file upload tab, YouTube tab
