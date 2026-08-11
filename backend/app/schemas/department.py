from pydantic import BaseModel


class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True
