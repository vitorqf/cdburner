# /docs — Second Brain Index

This directory is the source of truth for design decisions, feature specs, and deployment knowledge.
Read the relevant doc before touching any feature area. Each subdirectory has its own CLAUDE.md.

## What's Here

| Directory | Contents |
|---|---|
| [architecture/](architecture/CLAUDE.md) | System overview, data model, tech stack rationale |
| [features/](features/CLAUDE.md) | Per-feature behavior specs |
| [api/](api/CLAUDE.md) | Endpoint contracts and request/response shapes |
| [deployment/](deployment/CLAUDE.md) | Docker Compose, homelab setup, env vars |
| [decisions/](decisions/CLAUDE.md) | Architecture Decision Records (ADRs) |
| [TODO.md](TODO.md) | Kanban board — current status of all work |

## How to Use This

- **Before implementing a feature**: read its spec in `features/`.
- **Before adding an endpoint**: check `api/endpoints.md` for existing contracts.
- **Unsure why something was built a certain way**: check `decisions/`.
- **Need to deploy or change infra**: read `deployment/homelab.md`.
- **Want to know what's in progress**: read `TODO.md`.
