# ADR-003: Drop Spotify Import for v1

**Status**: Accepted

## Decision
Spotify playlist import is not included in v1.

## Reason
Spotify audio has DRM — the only viable implementation is: Spotify API for metadata → YouTube search → yt-dlp download.
This introduces matching errors (wrong versions, covers, live recordings) and requires a Spotify developer app registration.
Keeping v1 to file upload + YouTube keeps the scope tight and covers the primary use case.

## Future
Can be added as v2 feature. The backend service layer has a clear place for it (`services/spotify.py`).
The implementation would be: `spotipy` library to read playlist, then reuse the existing YouTube download service per track.
