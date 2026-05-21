from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .track import TrackOut


class DiscTrackOut(BaseModel):
    id: str
    disc_id: str
    track_id: str
    position: int
    track: TrackOut

    model_config = {"from_attributes": True}


class DiscOut(BaseModel):
    id: str
    name: str
    format: str
    capacity_seconds: int
    cover_image_path: Optional[str]
    tracks: list[DiscTrackOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DiscCreateIn(BaseModel):
    name: str
    format: str = "audio"        # audio | mp3
    capacity_seconds: int = 74 * 60


class DiscUpdateIn(BaseModel):
    name: Optional[str] = None


class DiscTrackAddIn(BaseModel):
    track_id: str
    position: int


class DiscTrackReorderIn(BaseModel):
    position: int
