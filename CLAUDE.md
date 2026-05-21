# CDburner — Project Bible

CDburner is a self-hosted web service for building and burning CDs from file uploads and YouTube URLs.
Runs on a homelab Ubuntu Server with a physical CD drive. Built for personal use (two users, no auth).

## Quick Navigation

| Need | Go to |
|---|---|
| Project overview & goals | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Tech stack & why | [docs/architecture/stack.md](docs/architecture/stack.md) |
| Architecture decisions log | [docs/decisions/](docs/decisions/) |
| Feature specs | [docs/features/](docs/features/) |
| API reference | [docs/api/endpoints.md](docs/api/endpoints.md) |
| Homelab deployment | [docs/deployment/homelab.md](docs/deployment/homelab.md) |
| What's next / in progress | [docs/TODO.md](docs/TODO.md) |

## Directory Layout

```
cdburner/
├── CLAUDE.md                  ← you are here
├── docs/                      ← second brain (read this before touching code)
│   ├── architecture/          ← system design, stack, data model
│   ├── features/              ← per-feature specs and behavior
│   ├── api/                   ← endpoint contracts
│   ├── deployment/            ← homelab setup, Docker, env vars
│   ├── decisions/             ← ADRs (why we chose X over Y)
│   └── TODO.md                ← kanban board
├── backend/                   ← FastAPI Python app
│   └── app/
│       ├── api/               ← route handlers
│       ├── services/          ← business logic (burner, yt-dlp, audio)
│       └── models/            ← SQLAlchemy models
├── frontend/                  ← React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── pages/
│       └── components/
└── storage/                   ← runtime data (gitignored)
    ├── uploads/
    ├── converted/
    └── temp/
```

## Core Concepts

- **Disc**: a project representing one physical CD. Has a name, format (Audio CD or MP3), capacity, and an ordered tracklist.
- **Track**: a single audio file. Can come from a file upload or a YouTube URL. Has a status lifecycle: `pending → downloading → ready | error`.
- **BurnJob**: a queued or active burn operation for a Disc. One job at a time; prompts before starting the next.

## Key Constraints

- One physical CD drive (`/dev/sr0`) — jobs are sequential, never parallel.
- Audio CD format: time-limited (74 min = 4440s, 80 min = 4800s). All tracks converted to CDDA WAV.
- MP3 disc format: size-limited (~700 MB). Tracks kept as MP3.
- Disc format is chosen at disc creation time (affects the capacity bar in the editor).
- No auth — homelab LAN only.

## Stack at a Glance

| Layer | Tech |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| CD burning | `wodim` (Ubuntu package) |
| Audio processing | `ffmpeg` |
| YouTube download | `yt-dlp` |
| Deployment | Docker Compose |

## Development Commands

```bash
# Start everything
docker compose up --build

# Backend only (local dev)
cd backend && uvicorn app.main:app --reload

# Frontend only (local dev)
cd frontend && npm run dev
```

> See [docs/deployment/homelab.md](docs/deployment/homelab.md) for full setup instructions.
