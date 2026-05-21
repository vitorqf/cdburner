from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TrackOut(BaseModel):
    id: str
    title: str
    artist: Optional[str]
    album: Optional[str]
    duration_seconds: Optional[float]
    source: str
    source_url: Optional[str]
    status: str
    error_message: Optional[str]
    file_size_bytes: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class YoutubeImportIn(BaseModel):
    url: str
