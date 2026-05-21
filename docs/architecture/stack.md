# Tech Stack

## Backend — Python 3.12 + FastAPI

- FastAPI for async HTTP and Server-Sent Events (SSE).
- SQLAlchemy (sync) with SQLite — no migration tool needed at this scale.
- `yt-dlp` Python library for YouTube audio extraction.
- `ffmpeg-python` (thin wrapper over the `ffmpeg` binary) for audio conversion.
- `pydantic-settings` for typed config from `.env`.
- `python-multipart` for file upload support.

SQLite is intentional: single-user homelab, no concurrent writers, zero ops overhead.
If multi-user ever becomes a need, swap to PostgreSQL (SQLAlchemy makes this a one-line change).

## Frontend — React 18 + Vite + TypeScript + Tailwind CSS

- Vite for fast HMR during development.
- React Query (`@tanstack/react-query`) for server state — avoids manual loading/error boilerplate.
- `react-beautiful-dnd` (or `@dnd-kit/core`) for drag-and-drop track reordering.
- Tailwind CSS for styling. Visual design done separately via `/impeccable`.
- No global state library needed — React Query + local component state is sufficient.

## CD Burning — wodim

- `wodim` is the standard Ubuntu CD burning tool (successor to cdrecord).
- Audio CD burn command: `wodim dev=/dev/sr0 -audio -pad track1.wav track2.wav ...`
- MP3 disc burn command: `wodim dev=/dev/sr0 -data -fs 2048 -joliet -rock file1.mp3 ...`
- The backend shells out to `wodim` as a subprocess and captures stdout for progress.
- `/dev/sr0` is passed into the Docker container via `devices:` in docker-compose.yml.

## Deployment — Docker Compose

- Two services: `backend` and `frontend`.
- `storage/` is a bind-mounted volume so data survives container rebuilds.
- The host's CD device (`/dev/sr0`) is passed through to the backend container.
- No reverse proxy for LAN-only use; add nginx if you ever expose it externally.
