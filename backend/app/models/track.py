from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base
import uuid


class Track(Base):
    __tablename__ = "tracks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    artist = Column(String, nullable=True)
    album = Column(String, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    file_path = Column(String, nullable=True)
    wav_path = Column(String, nullable=True)
    source = Column(String, nullable=False)       # upload | youtube
    source_url = Column(String, nullable=True)
    status = Column(String, default="pending")    # pending | downloading | ready | error
    error_message = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    disc_tracks = relationship("DiscTrack", cascade="all, delete-orphan", back_populates="track")
