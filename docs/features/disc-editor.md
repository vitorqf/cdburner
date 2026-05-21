# Feature: Disc Editor

## Summary
The core screen. Users build a tracklist for one disc, see real-time capacity, reorder tracks, and trigger a burn.

## Behavior

### Creating a disc
- User enters a name and selects a format (Audio CD or MP3 disc).
- Format cannot be changed after creation (it determines the capacity unit).
- Optionally selects 74 min or 80 min capacity (Audio CD only).

### Adding tracks
- Tracks can be added from the Track Library (previously imported/uploaded tracks).
- Or imported directly from the editor via the import panel (see [track-import.md](track-import.md)).
- A track can appear on multiple discs.

### Capacity bar
- Audio CD: shows time used vs. total (e.g. "52:14 / 74:00"). Unit: mm:ss.
- MP3 disc: shows MB used vs. total (e.g. "312 MB / 700 MB"). Unit: MB.
- Bar turns yellow at 90% capacity, red when over limit.
- Tracks that would push over the limit are still addable but flagged — user must resolve before burning.

### Track ordering
- Drag-and-drop reorder within the tracklist.
- `position` field on DiscTrack is updated on drop.

### Removing a track
- Removes the DiscTrack row (does not delete the Track from the library).

### Burning
- "Burn" button is enabled only when:
  - Disc has at least one track.
  - All tracks have status `ready`.
  - Total duration/size is within capacity.
- On click → creates a BurnJob → navigates to burn status view.
