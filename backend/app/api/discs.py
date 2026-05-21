from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Disc, DiscTrack
from ..schemas.disc import (
    DiscCreateIn,
    DiscOut,
    DiscTrackAddIn,
    DiscTrackOut,
    DiscUpdateIn,
    DiscTrackReorderIn,
)
from ..config import settings

router = APIRouter()


@router.post("", response_model=DiscOut, status_code=201)
def create_disc(body: DiscCreateIn, db: Session = Depends(get_db)):
    disc = Disc(
        name=body.name,
        format=body.format,
        capacity_seconds=body.capacity_seconds,
    )
    db.add(disc)
    db.commit()
    db.refresh(disc)
    return DiscOut.model_validate(disc)


@router.get("", response_model=list[DiscOut])
def list_discs(db: Session = Depends(get_db)):
    discs = db.query(Disc).order_by(Disc.created_at.desc()).all()
    return [DiscOut.model_validate(d) for d in discs]


@router.get("/{disc_id}", response_model=DiscOut)
def get_disc(disc_id: str, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    return DiscOut.model_validate(disc)


@router.patch("/{disc_id}", response_model=DiscOut)
def update_disc(disc_id: str, body: DiscUpdateIn, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    if body.name is not None:
        disc.name = body.name
    db.commit()
    db.refresh(disc)
    return DiscOut.model_validate(disc)


@router.delete("/{disc_id}", status_code=204)
def delete_disc(disc_id: str, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    db.delete(disc)
    db.commit()


@router.post("/{disc_id}/tracks", response_model=DiscTrackOut, status_code=201)
def add_track_to_disc(disc_id: str, body: DiscTrackAddIn, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    dt = DiscTrack(disc_id=disc_id, track_id=body.track_id, position=body.position)
    db.add(dt)
    db.commit()
    db.refresh(dt)
    return DiscTrackOut.model_validate(dt)


@router.patch("/{disc_id}/tracks/{dt_id}", response_model=DiscTrackOut)
def reorder_track(disc_id: str, dt_id: str, body: DiscTrackReorderIn, db: Session = Depends(get_db)):
    dt = db.get(DiscTrack, dt_id)
    if not dt or dt.disc_id != disc_id:
        raise HTTPException(404, "DiscTrack not found")
    dt.position = body.position
    db.commit()
    db.refresh(dt)
    return DiscTrackOut.model_validate(dt)


@router.delete("/{disc_id}/tracks/{dt_id}", status_code=204)
def remove_track_from_disc(disc_id: str, dt_id: str, db: Session = Depends(get_db)):
    dt = db.get(DiscTrack, dt_id)
    if not dt or dt.disc_id != disc_id:
        raise HTTPException(404, "DiscTrack not found")
    db.delete(dt)
    db.commit()


@router.post("/{disc_id}/cover", response_model=DiscOut)
async def upload_cover(disc_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png"}:
        raise HTTPException(400, "Cover must be JPEG or PNG")

    settings.covers_path.mkdir(parents=True, exist_ok=True)
    dest = settings.covers_path / f"{disc_id}{ext}"
    async with aiofiles.open(dest, "wb") as f:
        await f.write(await file.read(5 * 1024 * 1024))

    disc.cover_image_path = str(dest)
    db.commit()
    db.refresh(disc)
    return DiscOut.model_validate(disc)


@router.delete("/{disc_id}/cover", response_model=DiscOut)
def delete_cover(disc_id: str, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    if disc.cover_image_path:
        p = Path(disc.cover_image_path)
        if p.exists():
            p.unlink()
    disc.cover_image_path = None
    db.commit()
    db.refresh(disc)
    return DiscOut.model_validate(disc)
