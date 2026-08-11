from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from backend.app.database.session import get_db
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.schemas.signup import SignupRequest
from backend.app.schemas.user import UserResponse
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.hostel_block import HostelBlock
from backend.app.models.enums import Role
from backend.app.auth.security import verify_password, get_password_hash, create_access_token
from backend.app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    target_role = (payload.role or "STUDENT").upper().strip()

    # 1. Reject WATCHMAN or invalid role
    if target_role == "WATCHMAN" or target_role not in ["STUDENT", "HOD", "WARDEN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watchman accounts cannot be created through public signup." if target_role == "WATCHMAN" else "Invalid account type specified for signup."
        )

    # 2. Validate password match and basic fields
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name is required.")
    if not payload.email or not payload.email.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required.")

    # 3. Unique email check
    existing_email = db.query(User).filter(func.lower(User.email) == payload.email.lower().strip()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pwd = get_password_hash(payload.password)

    # 4. Role-specific validation & creation
    if target_role == "STUDENT":
        if not payload.register_number or not payload.register_number.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Register number is required.")
        if not payload.room_number or not payload.room_number.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room number is required.")
        if not payload.year or payload.year not in [1, 2, 3, 4]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid year selected.")
        if not payload.department_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department selection is required.")
        if not payload.hostel_block_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hostel block selection is required.")

        existing_reg = db.query(User).filter(func.lower(User.register_number) == payload.register_number.lower().strip()).first()
        if existing_reg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this register number already exists."
            )

        dept = db.query(Department).filter(Department.id == payload.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department selected.")

        block = db.query(HostelBlock).filter(HostelBlock.id == payload.hostel_block_id).first()
        if not block:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hostel block selected.")

        new_user = User(
            name=payload.name.strip(),
            register_number=payload.register_number.strip().upper(),
            email=payload.email.lower().strip(),
            password_hash=hashed_pwd,
            role=Role.STUDENT,
            department_id=dept.id,
            hostel_block_id=block.id,
            year=payload.year,
            hostel=block.name,
            room_number=payload.room_number.strip(),
            is_active=True,
        )

    elif target_role == "HOD":
        if not payload.department_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department selection is required for HOD.")

        dept = db.query(Department).filter(Department.id == payload.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department selected.")

        # Check existing active HOD for this department
        existing_hod = db.query(User).filter(
            User.role == Role.HOD,
            User.department_id == dept.id,
            User.is_active == True
        ).first()
        if existing_hod:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active HOD already exists for this department."
            )

        new_user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            password_hash=hashed_pwd,
            role=Role.HOD,
            department_id=dept.id,
            is_active=True,
        )

    elif target_role == "WARDEN":
        if not payload.hostel_block_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hostel block selection is required for Warden.")

        block = db.query(HostelBlock).filter(HostelBlock.id == payload.hostel_block_id).first()
        if not block:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hostel block selected.")

        # Check existing active Warden for this hostel block
        existing_warden = db.query(User).filter(
            User.role == Role.WARDEN,
            User.hostel_block_id == block.id,
            User.is_active == True
        ).first()
        if existing_warden:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active Warden already exists for this hostel block."
            )

        new_user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            password_hash=hashed_pwd,
            role=Role.WARDEN,
            hostel_block_id=block.id,
            is_active=True,
        )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If new Warden was created, automatically update any PENDING_WARDEN_ASSIGNMENT outings for this block to PENDING_WARDEN
    if target_role == "WARDEN" and new_user.hostel_block_id:
        from backend.app.models.outing import OutingRequest
        from backend.app.models.enums import OutingStatus
        pending_unassigned = (
            db.query(OutingRequest)
            .join(User, OutingRequest.student_id == User.id)
            .filter(
                OutingRequest.status == OutingStatus.PENDING_WARDEN_ASSIGNMENT,
                User.hostel_block_id == new_user.hostel_block_id
            )
            .all()
        )
        for out_req in pending_unassigned:
            out_req.status = OutingStatus.PENDING_WARDEN
        db.commit()

    return new_user



@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == login_req.email, User.is_active == True)
        .options(joinedload(User.department), joinedload(User.hostel_block))
        .first()
    )
    if not user or not verify_password(login_req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        register_number=user.register_number,
        department_id=user.department_id,
        department_code=user.department.code if user.department else None,
        department_name=user.department.name if user.department else None,
        hostel_block_id=user.hostel_block_id,
        hostel_block_name=user.hostel_block.name if user.hostel_block else None,
        year=user.year,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

