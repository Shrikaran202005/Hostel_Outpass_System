from datetime import datetime
from pydantic import BaseModel
from backend.app.models.enums import GateStatus


class GateLogResponse(BaseModel):
    id: int
    outing_id: int
    watchman_id: int
    exit_time: datetime | None = None
    return_time: datetime | None = None
    delay_minutes: int | None = 0
    status: GateStatus
    created_at: datetime

    class Config:
        from_attributes = True

