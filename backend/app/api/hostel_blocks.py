from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.hostel_block import HostelBlock
from backend.app.schemas.hostel_block import HostelBlockResponse

router = APIRouter(prefix="/hostel-blocks", tags=["Hostel Blocks"])


@router.get("", response_model=List[HostelBlockResponse])
def get_hostel_blocks(db: Session = Depends(get_db)):
    return db.query(HostelBlock).order_by(HostelBlock.name.asc()).all()
