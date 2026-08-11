from datetime import datetime
from pydantic import BaseModel
from backend.app.models.enums import Role, ApprovalAction


class ActorInfo(BaseModel):
    id: int
    name: str
    role: Role

    class Config:
        from_attributes = True


class ApprovalHistoryResponse(BaseModel):
    id: int
    outing_id: int
    actor_id: int
    actor_role: Role
    action: ApprovalAction
    comment: str | None = None
    timestamp: datetime
    actor_name: str | None = None

    class Config:
        from_attributes = True
