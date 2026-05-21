# ADR-002: asyncio Queue over Celery/Redis

**Status**: Accepted

## Decision
Use a simple in-process `asyncio.Queue` for the burn job queue and background track processing.

## Reason
Celery + Redis is significant operational overhead (two extra containers, broker config, worker management) for a personal homelab tool that runs one job at a time.
An asyncio queue started with the FastAPI app lifecycle is sufficient and keeps deployment as a single `docker compose up`.

## Trade-off
State is lost on process restart — queued jobs that were `queued` or `burning` at restart time would need manual requeue.
Acceptable for a homelab; a formal job store (SQLite-backed queue) could be added later if this matters.
