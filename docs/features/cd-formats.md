# Feature: CD Formats

## Audio CD

- Plays in **any** standard CD player (car stereos, home hi-fi, boomboxes, radio players).
- Capacity: **74 minutes** (4440 seconds) or **80 minutes** (4800 seconds).
- All tracks must be converted to CDDA format: 44100 Hz, 16-bit, stereo WAV.
- ffmpeg command: `ffmpeg -i input.mp3 -ar 44100 -ac 2 -acodec pcm_s16le output.wav`
- Capacity bar unit: **time** (mm:ss).
- Typical use: music your girlfriend will play on the radio — use this format.

## MP3 Disc

- Plays only on **MP3-compatible CD players** (many modern players support this, but not all).
- Capacity: **~700 MB** (650 MB on older 74-min media).
- Tracks stay as MP3 — no conversion needed.
- Holds significantly more music: ~10 hours vs. 74 minutes.
- Capacity bar unit: **MB**.
- Typical use: when you want maximum tracks and the player supports MP3 CDs.

## How Format Is Chosen

Format is selected at **disc creation time** via a radio button:
- "Audio CD — plays everywhere (max 74 or 80 min)"
- "MP3 disc — plays on compatible players (max ~700 MB)"

**The format cannot be changed after the disc is created.** This is intentional: the capacity bar and burn pipeline depend on knowing the format upfront.

## Capacity Limits Reference

| Format | Media | Capacity |
|---|---|---|
| Audio CD | 74-min disc | 4440 seconds |
| Audio CD | 80-min disc | 4800 seconds |
| MP3 disc | Standard | 700 MB |
