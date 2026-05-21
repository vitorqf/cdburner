# ADR-004: CD Format Chosen at Disc Creation

**Status**: Accepted

## Decision
The disc format (Audio CD or MP3 disc) is set when the disc is created and cannot be changed.

## Reason
Format determines the capacity unit (seconds vs. MB) and the burn command used.
The capacity bar in the editor must know the format to display the correct limit and unit.
Allowing format changes mid-edit would require re-validating the whole tracklist and recalculating capacity retroactively.

## Trade-off
Users must delete and recreate a disc to change its format.
This is acceptable — in practice, the format decision is made before you start picking tracks.
