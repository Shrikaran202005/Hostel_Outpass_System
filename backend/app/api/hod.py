from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.enums import Role, OutingStatus
from backend.app.schemas.outing import OutingResponse, DecisionRequest
from backend.app.auth.deps import require_role
from backend.app.services.outing_service import OutingService

router = APIRouter(prefix="/hod", tags=["HOD Workflow"])


@router.get("/outings/pending", response_model=List[OutingResponse])
def get_pending_hod_outings(
    current_user: User = Depends(require_role([Role.HOD])),
    db: Session = Depends(get_db),
):
    outings = (
        db.query(OutingRequest)
        .join(User, OutingRequest.student_id == User.id)
        .filter(
            OutingRequest.status == OutingStatus.PENDING_HOD,
            User.department_id == current_user.department_id
        )
        .options(
            joinedload(OutingRequest.student).joinedload(User.department),
            joinedload(OutingRequest.student).joinedload(User.hostel_block),
            joinedload(OutingRequest.history_records)
        )
        .order_by(OutingRequest.created_at.asc())
        .all()
    )
    return outings


@router.get("/outings/{id}", response_model=OutingResponse)
def get_hod_outing_details(
    id: int,
    current_user: User = Depends(require_role([Role.HOD])),
    db: Session = Depends(get_db),
):
    outing = (
        db.query(OutingRequest)
        .filter(OutingRequest.id == id)
        .options(
            joinedload(OutingRequest.student).joinedload(User.department),
            joinedload(OutingRequest.student).joinedload(User.hostel_block),
            joinedload(OutingRequest.history_records)
        )
        .first()
    )
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.department_id != current_user.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOD is not authorized to access outings for other departments."
        )

    return outing


@router.post("/outings/{id}/approve", response_model=OutingResponse)
def approve_hod_outing(
    id: int,
    decision: DecisionRequest = DecisionRequest(),
    current_user: User = Depends(require_role([Role.HOD])),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.department_id != current_user.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOD is not authorized to approve outings for other departments."
        )

    return OutingService.hod_approve(db, id, current_user, decision.comment)


@router.post("/outings/{id}/reject", response_model=OutingResponse)
def reject_hod_outing(
    id: int,
    decision: DecisionRequest = DecisionRequest(),
    current_user: User = Depends(require_role([Role.HOD])),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.department_id != current_user.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOD is not authorized to reject outings for other departments."
        )

    return OutingService.hod_reject(db, id, current_user, decision.comment)
