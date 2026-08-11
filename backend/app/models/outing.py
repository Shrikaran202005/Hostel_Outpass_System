from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, Time, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.database.session import Base
from backend.app.models.enums import OutingStatus


class OutingRequest(Base):
    __tablename__ = "outing_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    outing_date = Column(Date, nullable=False)
    leaving_time = Column(Time, nullable=False)
    expected_return_time = Column(Time, nullable=False)
    destination = Column(String(255), nullable=False)
    reason = Column(String(500), nullable=False)
    status = Column(SQLEnum(OutingStatus), nullable=False, default=OutingStatus.PENDING_HOD)
    parent_approval_confirmed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="outings", foreign_keys=[student_id])
    history_records = relationship("ApprovalHistory", back_populates="outing", cascade="all, delete-orphan", order_by="ApprovalHistory.timestamp.asc()")
    gate_logs = relationship("GateLog", back_populates="outing", cascade="all, delete-orphan")
