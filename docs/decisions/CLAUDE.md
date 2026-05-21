# Architecture Decision Records

ADRs log *why* a choice was made, so future work doesn't revisit settled questions without knowing the context.

| File | Decision |
|---|---|
| [001-sqlite-over-postgres.md](001-sqlite-over-postgres.md) | Use SQLite instead of PostgreSQL |
| [002-no-celery.md](002-no-celery.md) | Use asyncio queue instead of Celery/Redis |
| [003-drop-spotify-v1.md](003-drop-spotify-v1.md) | Drop Spotify import for v1 |
| [004-format-at-creation.md](004-format-at-creation.md) | CD format chosen at disc creation, not at burn time |
