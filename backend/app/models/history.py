from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.database.session import Base
from backend.app.models.enums import Role, ApprovalAction


class ApprovalHistory(Base):
    __tablename__ = "approval_history"

    id = Column(Integer, primary_key=True, index=True)
    outing_id = Column(Integer, ForeignKey("outing_requests.id"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    actor_role = Column(SQLEnum(Role), nullable=False)
    action = Column(SQLEnum(ApprovalAction), nullable=False)
    comment = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    outing = relationship("OutingRequest", back_populates="history_records")
    actor = relationship("User", back_populates="approval_actions")
