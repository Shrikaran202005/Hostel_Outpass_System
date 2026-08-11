from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.enums import Role, OutingStatus
from backend.app.schemas.outing import OutingResponse, DecisionRequest, ParentConfirmationRequest
from backend.app.auth.deps import require_role
from backend.app.services.outing_service import OutingService

router = APIRouter(prefix="/warden", tags=["Warden Workflow"])


@router.get("/outings/pending", response_model=List[OutingResponse])
def get_pending_warden_outings(
    current_user: User = Depends(require_role([Role.WARDEN])),
    db: Session = Depends(get_db),
):
    outings = (
        db.query(OutingRequest)
        .join(User, OutingRequest.student_id == User.id)
        .filter(
            OutingRequest.status.in_([OutingStatus.PENDING_WARDEN, OutingStatus.PENDING_WARDEN_ASSIGNMENT]),
            User.hostel_block_id == current_user.hostel_block_id
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
def get_warden_outing_details(
    id: int,
    current_user: User = Depends(require_role([Role.WARDEN])),
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

    if outing.student and outing.student.hostel_block_id != current_user.hostel_block_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Warden is not authorized to access outings for other hostel blocks."
        )

    return outing


@router.post("/outings/{id}/parent-confirmation", response_model=OutingResponse)
def confirm_parent_approval(
    id: int,
    payload: ParentConfirmationRequest,
    current_user: User = Depends(require_role([Role.WARDEN])),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.hostel_block_id != current_user.hostel_block_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Warden is not authorized to process outings for other hostel blocks."
        )

    if not payload.parent_approval_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent approval boolean must be set to true to confirm."
        )
    return OutingService.warden_confirm_parent(db, id, current_user)


@router.post("/outings/{id}/approve", response_model=OutingResponse)
def approve_warden_outing(
    id: int,
    decision: DecisionRequest = DecisionRequest(),
    current_user: User = Depends(require_role([Role.WARDEN])),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.hostel_block_id != current_user.hostel_block_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Warden is not authorized to approve outings for other hostel blocks."
        )

    return OutingService.warden_approve(db, id, current_user, decision.comment)


@router.post("/outings/{id}/reject", response_model=OutingResponse)
def reject_warden_outing(
    id: int,
    decision: DecisionRequest = DecisionRequest(),
    current_user: User = Depends(require_role([Role.WARDEN])),
    db: Session = Depends(get_db),
):
    outing = db.query(OutingRequest).filter(OutingRequest.id == id).first()
    if not outing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

    if outing.student and outing.student.hostel_block_id != current_user.hostel_block_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Warden is not authorized to reject outings for other hostel blocks."
        )

    return OutingService.warden_reject(db, id, current_user, decision.comment)
