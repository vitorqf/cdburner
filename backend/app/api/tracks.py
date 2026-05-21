import asyncio
import json
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..db import get_db, SessionLocal
from ..models import Track
from ..schemas.track import TrackOut, YoutubeImportIn
from ..services import audio, youtube
from ..config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".flac", ".wav", ".m4a", ".aac", ".ogg"}


@router.post("/upload", response_model=list[TrackOut])
async def upload_tracks(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    max_bytes = settings.max_upload_mb * 1024 * 1024
    results = []
    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"Unsupported format: {ext}")

        dest = settings.uploads_path / f"{uuid4()}{ext}"
        async with aiofiles.open(dest, "wb") as f:
            content = await file.read(max_bytes + 1)
            if len(content) > max_bytes:
                raise HTTPException(413, f"{file.filename} exceeds {settings.max_upload_mb} MB limit")
            await f.write(content)

        name = Path(file.filename).stem
        track = Track(
            title=name,
            source="upload",
            file_path=str(dest),
            file_size_bytes=len(content),
            status="pending",
        )
        db.add(track)
        db.commit()
        db.refresh(track)
        background_tasks.add_task(audio.process_uploaded_track, track.id)
        results.append(TrackOut.model_validate(track))

    return results


@router.post("/youtube", response_model=list[TrackOut])
async def import_youtube(
    body: YoutubeImportIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    tracks = youtube.create_pending_tracks(body.url, db)
    for track in tracks:
        background_tasks.add_task(youtube.download_track, track.id)
    return [TrackOut.model_validate(t) for t in tracks]


@router.get("", response_model=list[TrackOut])
def list_tracks(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Track)
    if status:
        q = q.filter(Track.status == status)
    return [TrackOut.model_validate(t) for t in q.order_by(Track.created_at.desc()).all()]


@router.get("/{track_id}", response_model=TrackOut)
def get_track(track_id: str, db: Session = Depends(get_db)):
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(404, "Track not found")
    return TrackOut.model_validate(track)


@router.get("/{track_id}/status")
async def track_status_stream(track_id: str):
    async def generator():
        while True:
            db = SessionLocal()
            try:
                track = db.get(Track, track_id)
                if not track:
                    yield f"data: {json.dumps({'error': 'not found'})}\n\n"
                    break
                data = {"status": track.status, "error_message": track.error_message}
                yield f"data: {json.dumps(data)}\n\n"
                if track.status in ("ready", "error"):
                    break
            finally:
                db.close()
            await asyncio.sleep(1)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("/{track_id}", status_code=204)
def delete_track(track_id: str, db: Session = Depends(get_db)):
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(404, "Track not found")
    db.delete(track)
    db.commit()
