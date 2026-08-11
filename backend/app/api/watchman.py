from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.enums import Role, OutingStatus
from backend.app.schemas.outing import OutingResponse
from backend.app.schemas.user import StudentDirectoryResponse
from backend.app.auth.deps import require_role
from backend.app.services.outing_service import OutingService

router = APIRouter(prefix="/watchman", tags=["Watchman Workflow"])


@router.get("/outings/today", response_model=List[OutingResponse])
def get_todays_outings(
    current_user: User = Depends(require_role([Role.WATCHMAN])),
    db: Session = Depends(get_db),
):
    today = date.today()
    outings = (
        db.query(OutingRequest)
        .filter(
            OutingRequest.outing_date == today,
            OutingRequest.status.in_([
                OutingStatus.APPROVED,
                OutingStatus.EXITED,
                OutingStatus.COMPLETED,
                OutingStatus.LATE_RETURN
            ])
        )
        .options(joinedload(OutingRequest.student), joinedload(OutingRequest.history_records), joinedload(OutingRequest.gate_logs))
        .order_by(OutingRequest.leaving_time.asc())
        .all()
    )
    return outings


@router.get("/outings/search", response_model=List[OutingResponse])
def search_outings(
    query: str = Query(..., min_length=1, description="Register number or request ID or student name"),
    current_user: User = Depends(require_role([Role.WATCHMAN])),
    db: Session = Depends(get_db),
):
    query_str = query.strip()
    clean_str = query_str.replace("#OUT-", "").replace("#out-", "").strip()
    base_query = db.query(OutingRequest).join(User, OutingRequest.student_id == User.id)

    if clean_str.isdigit():
        req_id = int(clean_str)
        outings = base_query.filter(
            (OutingRequest.id == req_id) | (User.register_number.ilike(f"%{query_str}%")) | (User.name.ilike(f"%{query_str}%"))
        ).options(joinedload(OutingRequest.student), joinedload(OutingRequest.history_records), joinedload(OutingRequest.gate_logs)).all()
    else:
        outings = base_query.filter(
            (User.register_number.ilike(f"%{query_str}%")) | (User.name.ilike(f"%{query_str}%"))
        ).options(joinedload(OutingRequest.student), joinedload(OutingRequest.history_records), joinedload(OutingRequest.gate_logs)).all()

    return outings


@router.get("/students", response_model=List[StudentDirectoryResponse])
def get_all_students(
    search: Optional[str] = Query(None, description="Search by student name, register number, or outing ID"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    hostel_block_id: Optional[int] = Query(None, description="Filter by hostel block ID"),
    current_user: User = Depends(require_role([Role.WATCHMAN])),
    db: Session = Depends(get_db),
):
    query = (
        db.query(User)
        .filter(User.role == Role.STUDENT)
        .options(joinedload(User.department), joinedload(User.hostel_block))
    )

    if department_id:
        query = query.filter(User.department_id == department_id)

    if hostel_block_id:
        query = query.filter(User.hostel_block_id == hostel_block_id)

    if search:
        s = search.strip()
        clean_s = s.replace("#OUT-", "").replace("#out-", "").strip()

        if clean_s.isdigit():
            target_id = int(clean_s)
            query = (
                query.outerjoin(OutingRequest, User.id == OutingRequest.student_id)
                .filter(
                    (User.register_number.ilike(f"%{s}%")) |
                    (User.name.ilike(f"%{s}%")) |
                    (OutingRequest.id == target_id)
                )
                .distinct()
            )
        else:
            query = query.filter(
                (User.register_number.ilike(f"%{s}%")) |
                (User.name.ilike(f"%{s}%"))
            )

    students = query.order_by(User.name.asc()).all()

    result = []
    for student in students:
        latest_outing = (
            db.query(OutingRequest)
            .filter(OutingRequest.student_id == student.id)
            .options(joinedload(OutingRequest.student), joinedload(OutingRequest.history_records), joinedload(OutingRequest.gate_logs))
            .order_by(OutingRequest.id.desc())
            .first()
        )

        status_str = "NO ACTIVE OUTING"
        active_outing_data = None

        if latest_outing:
            status_str = latest_outing.status.value
            active_outing_data = latest_outing

        result.append(
            StudentDirectoryResponse(
                id=student.id,
                name=student.name,
                register_number=student.register_number,
                email=student.email,
                department_id=student.department_id,
                department_name=student.department.name if student.department else None,
                department_code=student.department.code if student.department else None,
                hostel_block_id=student.hostel_block_id,
                hostel_block_name=student.hostel_block.name if student.hostel_block else student.hostel,
                room_number=student.room_number,
                year=student.year,
                current_outing_status=status_str,
                active_outing=active_outing_data
            )
        )

    return result


@router.post("/outings/{id}/exit", response_model=OutingResponse)
def record_exit(
    id: int,
    current_user: User = Depends(require_role([Role.WATCHMAN])),
    db: Session = Depends(get_db),
):
    return OutingService.watchman_record_exit(db, id, current_user)


@router.post("/outings/{id}/return", response_model=OutingResponse)
def record_return(
    id: int,
    current_user: User = Depends(require_role([Role.WATCHMAN])),
    db: Session = Depends(get_db),
):
    return OutingService.watchman_record_return(db, id, current_user)
