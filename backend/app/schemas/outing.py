from datetime import date, time, datetime
from pydantic import BaseModel, Field
from backend.app.models.enums import OutingStatus
from backend.app.schemas.user import UserResponse
from backend.app.schemas.history import ApprovalHistoryResponse
from backend.app.schemas.gatelog import GateLogResponse


class OutingCreate(BaseModel):
    outing_date: date
    leaving_time: time
    expected_return_time: time
    destination: str = Field(..., min_length=1, max_length=255)
    reason: str = Field(..., min_length=1, max_length=500)


class DecisionRequest(BaseModel):
    comment: str | None = None


class ParentConfirmationRequest(BaseModel):
    parent_approval_confirmed: bool


class OutingResponse(BaseModel):
    id: int
    student_id: int
    outing_date: date
    leaving_time: time
    expected_return_time: time
    destination: str
    reason: str
    status: OutingStatus
    parent_approval_confirmed: bool
    created_at: datetime
    updated_at: datetime

    student: UserResponse | None = None
    history_records: list[ApprovalHistoryResponse] = []
    gate_logs: list[GateLogResponse] = []

    class Config:
        from_attributes = True
