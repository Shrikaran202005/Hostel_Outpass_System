import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class SignupRequest(BaseModel):
    role: str = "STUDENT"  # "STUDENT", "HOD", "WARDEN"
    name: str = Field(..., min_length=1)
    email: str
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=1)
    
    # Student specific fields
    register_number: Optional[str] = None
    year: Optional[int] = None
    room_number: Optional[str] = None
    
    # Department / Hostel Block IDs
    department_id: Optional[int] = None
    hostel_block_id: Optional[int] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        if not v or not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Email must have a valid email format.")
        return v.strip().lower()
