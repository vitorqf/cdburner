from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "CDburner"
    debug: bool = False

    storage_path: Path = Path("/storage")
    uploads_path: Path = Path("/storage/uploads")
    converted_path: Path = Path("/storage/converted")
    temp_path: Path = Path("/storage/temp")
    covers_path: Path = Path("/storage/uploads/covers")

    database_url: str = "sqlite:////storage/cdburner.db"

    cd_device: str = "/dev/sr0"
    cd_capacity_74min: int = 74 * 60
    cd_capacity_80min: int = 80 * 60

    max_upload_mb: int = 200
    yt_dlp_max_playlist: int = 50

    class Config:
        env_file = ".env"


settings = Settings()
