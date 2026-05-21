"""wodim wrapper: burn Audio CD or MP3 data disc."""
import asyncio
import re
from datetime import datetime
from pathlib import Path

from ..config import settings
from ..db import SessionLocal
from ..models import BurnJob, Disc


def _parse_progress(line: str) -> float | None:
    """Parse wodim progress from lines like 'Track 01:  12 of  74 MB written'."""
    m = re.search(r"(\d+)\s+of\s+(\d+)\s+MB written", line)
    if m:
        written, total = int(m.group(1)), int(m.group(2))
        if total > 0:
            return round(written / total * 100, 1)
    return None


def _audio_cmd(device: str, wav_paths: list[str]) -> list[str]:
    return ["wodim", f"dev={device}", "-v", "-audio", "-pad", *wav_paths]


def _mp3_cmd(device: str, mp3_paths: list[str]) -> list[str]:
    return [
        "wodim", f"dev={device}", "-v", "-data",
        "-fs", "2048", "-joliet", "-rock",
        *mp3_paths,
    ]


async def run_burn_job(job_id: str):
    db = SessionLocal()
    try:
        job = db.get(BurnJob, job_id)
        if not job:
            return

        # Signal UI to prompt disc insertion
        job.status = "awaiting_disc"
        db.commit()

        # Poll for user confirmation (PATCH /burn/{id}/confirm sets status="burning")
        for _ in range(300):
            await asyncio.sleep(1)
            db.refresh(job)
            if job.status == "burning":
                break
        else:
            job.status = "error"
            job.error_message = "Timed out waiting for disc confirmation"
            db.commit()
            return

        disc: Disc = db.get(Disc, job.disc_id)
        ordered_tracks = sorted(disc.tracks, key=lambda dt: dt.position)

        if disc.format == "audio":
            paths = [dt.track.wav_path for dt in ordered_tracks if dt.track.wav_path]
            cmd = _audio_cmd(settings.cd_device, paths)
        else:
            paths = [dt.track.file_path for dt in ordered_tracks if dt.track.file_path]
            cmd = _mp3_cmd(settings.cd_device, paths)

        if not paths:
            job.status = "error"
            job.error_message = "No track files available for burning"
            db.commit()
            return

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )

        async for raw_line in proc.stdout:
            line = raw_line.decode().strip()
            job.log_output = (job.log_output or "") + line + "\n"
            progress = _parse_progress(line)
            if progress is not None:
                job.progress_percent = progress
            db.commit()

        await proc.wait()
        if proc.returncode == 0:
            job.status = "done"
            job.progress_percent = 100.0
        else:
            job.status = "error"
            last_lines = (job.log_output or "").strip().splitlines()
            job.error_message = last_lines[-1] if last_lines else "wodim exited with error"

        job.finished_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        db.rollback()
        job = db.get(BurnJob, job_id)
        if job:
            job.status = "error"
            job.error_message = str(e)
            job.finished_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()
