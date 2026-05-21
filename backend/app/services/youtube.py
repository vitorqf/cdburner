"""yt-dlp wrapper: create pending Track records, then download in background."""
import asyncio
from pathlib import Path
from uuid import uuid4

import yt_dlp
from sqlalchemy.orm import Session

from ..config import settings
from ..db import SessionLocal
from ..models import Track
from .audio import _to_cdda_wav, _extract_duration


def _ydl_opts(output_template: str) -> dict:
    return {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "postprocessors": [],
    }


def create_pending_tracks(url: str, db: Session) -> list[Track]:
    """Extract playlist/video metadata without downloading, create pending records."""
    opts = {**_ydl_opts(""), "extract_flat": "in_playlist", "quiet": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    entries = info.get("entries") or [info]
    entries = entries[: settings.yt_dlp_max_playlist]

    tracks = []
    for entry in entries:
        track = Track(
            title=entry.get("title") or "Unknown",
            artist=entry.get("uploader"),
            duration_seconds=entry.get("duration"),
            source="youtube",
            source_url=entry.get("webpage_url") or url,
            status="pending",
        )
        db.add(track)
        db.flush()
        tracks.append(track)

    db.commit()
    for t in tracks:
        db.refresh(t)
    return tracks


def download_track(track_id: str):
    """Background task — download audio and convert to WAV."""
    asyncio.run(_download(track_id))


async def _download(track_id: str):
    db = SessionLocal()
    try:
        track = db.get(Track, track_id)
        if not track or not track.source_url:
            return

        track.status = "downloading"
        db.commit()

        dest_stem = settings.uploads_path / f"{track_id}"
        opts = {
            **_ydl_opts(str(dest_stem) + ".%(ext)s"),
            "quiet": True,
        }
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(track.source_url, download=True)

        # yt-dlp writes the actual extension — find the file
        downloaded = next(settings.uploads_path.glob(f"{track_id}.*"), None)
        if not downloaded:
            track.status = "error"
            track.error_message = "yt-dlp did not produce a file"
            db.commit()
            return

        track.file_path = str(downloaded)
        track.file_size_bytes = downloaded.stat().st_size
        if not track.duration_seconds and info.get("duration"):
            track.duration_seconds = info["duration"]
        db.commit()

        wav_dest = settings.converted_path / f"{track_id}.wav"
        success = await _to_cdda_wav(str(downloaded), str(wav_dest))

        if success:
            track.wav_path = str(wav_dest)
            track.status = "ready"
        else:
            track.status = "error"
            track.error_message = "ffmpeg conversion failed"
        db.commit()
    except Exception as e:
        db.rollback()
        track = db.get(Track, track_id)
        if track:
            track.status = "error"
            track.error_message = str(e)
            db.commit()
    finally:
        db.close()
