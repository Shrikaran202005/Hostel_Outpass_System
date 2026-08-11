from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class HostelBlock(Base):
    __tablename__ = "hostel_blocks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="hostel_block")
