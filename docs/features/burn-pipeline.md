# Feature: Burn Pipeline

## Queue Behavior
- Only one BurnJob runs at a time (single physical CD drive).
- Jobs are processed in FIFO order.
- Multiple discs can be queued; they wait until the drive is free.

## Job Lifecycle

```
queued → awaiting_disc → burning → done
                                 ↘ error
```

### awaiting_disc
Before starting the actual burn, the backend emits an `insert_disc` event over SSE.
The frontend shows a blocking modal: **"Insert a blank disc into the drive, then click Confirm."**
The burn does not proceed until the user hits `PATCH /api/burn/{job_id}/confirm`.
This prevents wasted discs when the drive is empty.

### burning
- `wodim` is launched as a subprocess.
- stdout is captured line by line and stored in `BurnJob.log_output`.
- Progress percent is parsed from wodim's output and broadcast over SSE.
- Frontend shows a live progress bar.

### done / error
- On success: status set to `done`, `finished_at` recorded.
- On failure: status set to `error`, `error_message` populated with the last meaningful wodim error line.
- In both cases, if there are more jobs in the queue, the worker moves to the next one (which will trigger another `awaiting_disc` prompt).

## Cancellation
- A `queued` job can be cancelled (deleted) before it starts.
- A `burning` job cannot be cancelled mid-burn (wodim doesn't support clean mid-burn abort without risking a coaster).

## wodim Commands

Audio CD:
```bash
wodim dev=/dev/sr0 -v -audio -pad track01.wav track02.wav ...
```

MP3 disc (data):
```bash
wodim dev=/dev/sr0 -v -data -fs 2048 -joliet -rock track01.mp3 track02.mp3 ...
```
