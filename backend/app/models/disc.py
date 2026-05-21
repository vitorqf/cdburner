from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base
import uuid


class Disc(Base):
    __tablename__ = "discs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    format = Column(String, nullable=False, default="audio")  # audio | mp3
    capacity_seconds = Column(Integer, default=74 * 60)       # audio format only
    cover_image_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tracks = relationship(
        "DiscTrack",
        back_populates="disc",
        order_by="DiscTrack.position",
        cascade="all, delete-orphan",
    )
    burn_jobs = relationship("BurnJob", back_populates="disc", cascade="all, delete-orphan")


class DiscTrack(Base):
    __tablename__ = "disc_tracks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disc_id = Column(String, ForeignKey("discs.id"), nullable=False)
    track_id = Column(String, ForeignKey("tracks.id"), nullable=False)
    position = Column(Integer, nullable=False)

    disc = relationship("Disc", back_populates="tracks")
    track = relationship("Track")


class BurnJob(Base):
    __tablename__ = "burn_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disc_id = Column(String, ForeignKey("discs.id"), nullable=False)
    # queued | awaiting_disc | burning | done | error
    status = Column(String, default="queued")
    progress_percent = Column(Float, default=0.0)
    log_output = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)

    disc = relationship("Disc", back_populates="burn_jobs")
