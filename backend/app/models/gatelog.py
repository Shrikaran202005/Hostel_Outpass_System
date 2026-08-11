from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.database.session import Base
from backend.app.models.enums import GateStatus


class GateLog(Base):
    __tablename__ = "gate_logs"

    id = Column(Integer, primary_key=True, index=True)
    outing_id = Column(Integer, ForeignKey("outing_requests.id"), nullable=False, index=True)
    watchman_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exit_time = Column(DateTime, nullable=True)
    return_time = Column(DateTime, nullable=True)
    delay_minutes = Column(Integer, nullable=True, default=0)
    status = Column(SQLEnum(GateStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    outing = relationship("OutingRequest", back_populates="gate_logs")
    watchman = relationship("User", back_populates="gate_logs")

