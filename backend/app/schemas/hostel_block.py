from pydantic import BaseModel


class HostelBlockResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
