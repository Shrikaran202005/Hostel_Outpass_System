from pydantic import BaseModel
from backend.app.models.enums import Role


class LoginRequest(BaseModel):
    email: str
    password: str



class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: Role
    register_number: str | None = None
    department_id: int | None = None
    department_code: str | None = None
    department_name: str | None = None
    hostel_block_id: int | None = None
    hostel_block_name: str | None = None
    year: int | None = None


class TokenData(BaseModel):
    sub: str | None = None
    role: str | None = None
