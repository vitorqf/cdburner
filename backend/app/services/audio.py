"""ffmpeg wrapper: extract metadata, convert to CDDA WAV for Audio CD."""
import asyncio
import json
from pathlib import Path

from ..config import settings
from ..db import SessionLocal
from ..models import Track


async def _run(cmd: list[str]) -> tuple[int, str, str]:
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return proc.returncode, stdout.decode(), stderr.decode()


async def _extract_duration(file_path: str) -> float | None:
    code, out, _ = await _run([
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", file_path,
    ])
    if code != 0:
        return None
    try:
        return float(json.loads(out)["format"]["duration"])
    except (KeyError, ValueError):
        return None


async def _to_cdda_wav(src: str, dest: str) -> bool:
    code, _, _ = await _run([
        "ffmpeg", "-y", "-i", src,
        "-ar", "44100", "-ac", "2", "-acodec", "pcm_s16le",
        dest,
    ])
    return code == 0


def process_uploaded_track(track_id: str):
    """Background task — runs outside the request context."""
    import asyncio
    asyncio.run(_process(track_id))


async def _process(track_id: str):
    db = SessionLocal()
    try:
        track = db.get(Track, track_id)
        if not track or not track.file_path:
            return

        duration = await _extract_duration(track.file_path)
        if duration:
            track.duration_seconds = duration
            db.commit()

        wav_dest = settings.converted_path / f"{track_id}.wav"
        success = await _to_cdda_wav(track.file_path, str(wav_dest))

        if success:
            track.wav_path = str(wav_dest)
            track.status = "ready"
        else:
            track.status = "error"
            track.error_message = "ffmpeg conversion failed"
        db.commit()
    except Exception as e:
        track = db.get(Track, track_id)
        if track:
            track.status = "error"
            track.error_message = str(e)
            db.commit()
    finally:
        db.close()
