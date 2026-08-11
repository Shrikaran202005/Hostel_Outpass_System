from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="department")
