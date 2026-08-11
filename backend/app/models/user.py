from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.database.session import Base
from backend.app.models.enums import Role


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    register_number = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(Role), nullable=False)
    
    # Organizational Scoping Foreign Keys
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    hostel_block_id = Column(Integer, ForeignKey("hostel_blocks.id"), nullable=True, index=True)
    year = Column(Integer, nullable=True)  # e.g. 1, 2, 3, 4 for students

    hostel = Column(String(100), nullable=True)
    room_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    hostel_block = relationship("HostelBlock", back_populates="users", foreign_keys=[hostel_block_id])
    outings = relationship("OutingRequest", back_populates="student", foreign_keys="OutingRequest.student_id")
    approval_actions = relationship("ApprovalHistory", back_populates="actor", foreign_keys="ApprovalHistory.actor_id")
    gate_logs = relationship("GateLog", back_populates="watchman", foreign_keys="GateLog.watchman_id")
