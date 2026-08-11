from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.enums import Role
from backend.app.schemas.outing import OutingCreate, OutingResponse
from backend.app.schemas.history import ApprovalHistoryResponse
from backend.app.auth.deps import get_current_user, require_role
from backend.app.services.outing_service import OutingService

router = APIRouter(prefix="/outings", tags=["Outings"])


@router.post("", response_model=OutingResponse, status_code=status.HTTP_201_CREATED)
def create_outing(
    outing_data: OutingCreate,
    current_user: User = Depends(require_role([Role.STUDENT])),
    db: Session = Depends(get_db),
):
    return OutingService.create_outing_request(db, current_user, outing_data)


@router.get("/my", response_model=List[OutingResponse])
def get_my_outings(
    current_user: User = Depends(require_role([Role.STUDENT])),
    db: Session = Depends(get_db),
):
    outings = (
        db.query(OutingRequest)
        .filter(OutingRequest.student_id == current_user.id)
        .options(
            joinedload(OutingRequest.history_records),
            joinedload(OutingRequest.student).joinedload(User.department),
            joinedload(OutingRequest.student).joinedload(User.hostel_block)
        )
        .order_by(OutingRequest.created_at.desc())
        .all()
    )
    return outings


@router.get("/{id}", response_model=OutingResponse)
def get_outing_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    outing = (
        db.query(OutingRequest)
        .filter(OutingRequest.id == id)
        .options(joinedload(OutingRequest.history_records), joinedload(OutingRequest.student))
        .first()
    )
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    # Authorization check: Student can only view own outing
    if current_user.role == Role.STUDENT and outing.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this outing request.")

    return outing


@router.post("/{id}/cancel", response_model=OutingResponse)
def cancel_outing(
    id: int,
    current_user: User = Depends(require_role([Role.STUDENT])),
    db: Session = Depends(get_db),
):
    return OutingService.cancel_outing_request(db, id, current_user)


@router.get("/{id}/history", response_model=List[ApprovalHistoryResponse])
def get_outing_history(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if current_user.role == Role.STUDENT and outing.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this history.")

    history_records = outing.history_records
    res = []
    for h in history_records:
        item = ApprovalHistoryResponse.model_validate(h)
        if h.actor:
            item.actor_name = h.actor.name
        res.append(item)
    return res
