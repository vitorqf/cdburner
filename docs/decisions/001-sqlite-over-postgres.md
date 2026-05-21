# ADR-001: SQLite over PostgreSQL

**Status**: Accepted

## Decision
Use SQLite as the database.

## Reason
Single homelab instance, at most 2 users, no concurrent writes from multiple processes.
SQLite has zero operational overhead — no separate container, no credentials, no backups beyond copying a file.

## Trade-off
If this ever becomes multi-user or needs concurrent writes, migrate to PostgreSQL.
SQLAlchemy makes this a one-line change in `config.py` (`DATABASE_URL`).
