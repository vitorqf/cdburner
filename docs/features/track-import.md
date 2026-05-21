# Feature: Track Import

## Sources

### File Upload
- Accepted formats: MP3, FLAC, WAV, M4A, AAC, OGG.
- Max file size: 200 MB per file (configurable via env `MAX_UPLOAD_MB`).
- On upload: file saved to `storage/uploads/`, ffmpeg extracts metadata (title, artist, duration), WAV conversion queued.
- Multiple files can be uploaded at once.

### YouTube URL
- Accepts: single video URL, playlist URL.
- Single video → creates one Track.
- Playlist → creates one Track per video in the playlist (up to 50 tracks, configurable).
- Backend uses `yt-dlp` to download best audio quality, saves to `storage/uploads/`.
- Then ffmpeg converts to WAV (Audio CD) or normalizes MP3 (MP3 disc).
- Duration is read from yt-dlp metadata.

## Track Status Flow
```
pending → downloading → ready
                     ↘ error (error_message is populated)
```
- Frontend shows a spinner per track while status is `pending` or `downloading`.
- On `error`, shows the error message with a retry option.

## Track Library
- All imported tracks are stored globally (not per-disc).
- Tracks can be reused across multiple discs.
- Library screen: searchable/filterable list of all tracks with status badges.
- Tracks with status `error` can be retried or deleted.
- Deleting a track removes it from all discs it appears on (cascades via DiscTrack).
