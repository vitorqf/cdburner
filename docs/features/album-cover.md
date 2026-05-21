# Feature: Album Cover

## Purpose
Aesthetic only — displayed in the Disc Editor and Disc list. Not burned onto the disc.

## Behavior
- Each Disc has one optional cover image.
- User uploads an image file (JPEG or PNG, max 5 MB).
- Stored at `storage/uploads/covers/{disc_id}.{ext}`.
- Served back via `GET /api/discs/{disc_id}/cover`.
- If no cover is set, the UI shows a placeholder (designed via `/impeccable`).
- Replacing the cover overwrites the previous file.

## Endpoint
- `POST /api/discs/{disc_id}/cover` — multipart upload, returns updated disc object.
- `DELETE /api/discs/{disc_id}/cover` — removes the cover image.
