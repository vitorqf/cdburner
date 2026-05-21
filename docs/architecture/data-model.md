# Data Model

## Entities

### Track
Represents a single audio file, regardless of where it came from.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | string | required |
| artist | string | nullable |
| album | string | nullable |
| duration_seconds | float | set after processing |
| file_path | string | path to original file in `storage/uploads/` |
| wav_path | string | path to CDDA WAV in `storage/converted/` (Audio CD only) |
| source | enum | `upload` \| `youtube` |
| source_url | string | original YouTube URL if applicable |
| status | enum | `pending` \| `downloading` \| `ready` \| `error` |
| error_message | string | populated on error |
| file_size_bytes | int | nullable |
| created_at | datetime | |

### Disc
A project representing one physical CD to be burned.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | string | user-defined label |
| format | enum | `audio` \| `mp3` — set at creation, drives capacity logic |
| capacity_seconds | int | 4440 (74 min) or 4800 (80 min) — for audio format only |
| cover_image_path | string | path to uploaded album art image |
| created_at | datetime | |
| updated_at | datetime | |

### DiscTrack
Join table — ordered tracks on a disc.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| disc_id | FK → Disc | |
| track_id | FK → Track | |
| position | int | 1-based order on disc |

### BurnJob
A burn operation for a disc.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| disc_id | FK → Disc | |
| status | enum | `queued` \| `awaiting_disc` \| `burning` \| `done` \| `error` |
| progress_percent | float | 0–100 |
| log_output | text | full wodim stdout/stderr |
| error_message | string | summary on failure |
| created_at | datetime | |
| finished_at | datetime | |

## Relationships

```
Disc ──< DiscTrack >── Track
Disc ──< BurnJob
```

## Status Lifecycles

**Track**
```
pending → downloading → ready
                     ↘ error
```

**BurnJob**
```
queued → awaiting_disc → burning → done
                                 ↘ error
```
`awaiting_disc` is the state while the UI is showing the "Insert disc and confirm" prompt.
