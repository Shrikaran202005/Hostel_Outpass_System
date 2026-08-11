from datetime import datetime
from pydantic import BaseModel
from backend.app.models.enums import Role
from backend.app.schemas.department import DepartmentResponse
from backend.app.schemas.hostel_block import HostelBlockResponse


class UserBase(BaseModel):
    name: str
    email: str
    register_number: str | None = None

    role: Role
    department_id: int | None = None
    hostel_block_id: int | None = None
    year: int | None = None
    hostel: str | None = None
    room_number: str | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    department: DepartmentResponse | None = None
    hostel_block: HostelBlockResponse | None = None

    class Config:
        from_attributes = True


from backend.app.schemas.outing import OutingResponse


class StudentDirectoryResponse(BaseModel):
    id: int
    name: str
    register_number: str | None = None
    email: str
    department_id: int | None = None
    department_name: str | None = None
    department_code: str | None = None
    hostel_block_id: int | None = None
    hostel_block_name: str | None = None
    room_number: str | None = None
    year: int | None = None
    current_outing_status: str
    active_outing: OutingResponse | None = None

    class Config:
        from_attributes = True

