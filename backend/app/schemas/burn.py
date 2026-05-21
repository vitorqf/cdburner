from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BurnJobOut(BaseModel):
    id: str
    disc_id: str
    status: str
    progress_percent: float
    log_output: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    finished_at: Optional[datetime]

    model_config = {"from_attributes": True}
