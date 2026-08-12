from datetime import date, datetime, time
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.history import ApprovalHistory
from backend.app.models.gatelog import GateLog
from backend.app.models.enums import Role, OutingStatus, ApprovalAction, GateStatus
from backend.app.schemas.outing import OutingCreate


class OutingService:

    @staticmethod
    def create_outing_request(db: Session, student: User, outing_data: OutingCreate) -> OutingRequest:
        # Rule 1: Cannot request outing in the past
        today = date.today()
        if outing_data.outing_date < today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Outing date cannot be in the past."
            )

        # Rule 2: Leaving time must be before expected return time
        if outing_data.leaving_time >= outing_data.expected_return_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leaving time must be strictly before expected return time."
            )

        # Rule 3: Check overlapping active requests
        active_statuses = [
            OutingStatus.PENDING_HOD,
            OutingStatus.PENDING_WARDEN,
            OutingStatus.APPROVED,
            OutingStatus.EXITED
        ]
        existing_active = db.query(OutingRequest).filter(
            OutingRequest.student_id == student.id,
            OutingRequest.outing_date == outing_data.outing_date,
            OutingRequest.status.in_(active_statuses)
        ).all()

        for existing in existing_active:
            # Overlap condition: start1 < end2 and start2 < end1
            if outing_data.leaving_time < existing.expected_return_time and existing.leaving_time < outing_data.expected_return_time:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An active or pending outing request already overlaps with this time window."
                )

        new_outing = OutingRequest(
            student_id=student.id,
            outing_date=outing_data.outing_date,
            leaving_time=outing_data.leaving_time,
            expected_return_time=outing_data.expected_return_time,
            destination=outing_data.destination.strip(),
            reason=outing_data.reason.strip(),
            status=OutingStatus.PENDING_HOD,
            parent_approval_confirmed=False
        )
        db.add(new_outing)
        db.commit()
        db.refresh(new_outing)

        # Append audit history
        history = ApprovalHistory(
            outing_id=new_outing.id,
            actor_id=student.id,
            actor_role=Role.STUDENT,
            action=ApprovalAction.SUBMITTED,
            comment="Outing request submitted by student.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(new_outing)

        return new_outing

    @staticmethod
    def cancel_outing_request(db: Session, outing_id: int, student: User) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.student_id != student.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only cancel your own outing requests.")

        if outing.status not in [OutingStatus.PENDING_HOD, OutingStatus.PENDING_WARDEN]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel an outing request with status '{outing.status}'."
            )

        outing.status = OutingStatus.CANCELLED
        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=student.id,
            actor_role=Role.STUDENT,
            action=ApprovalAction.CANCELLED,
            comment="Request cancelled by student.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing

    @staticmethod
    def hod_approve(db: Session, outing_id: int, hod_user: User, comment: Optional[str] = None) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status != OutingStatus.PENDING_HOD:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"HOD can only process requests in PENDING_HOD status. Current status is '{outing.status}'."
            )

        # Check if an active Warden exists for the student's hostel block
        active_warden = None
        if outing.student and outing.student.hostel_block_id:
            active_warden = db.query(User).filter(
                User.role == Role.WARDEN,
                User.hostel_block_id == outing.student.hostel_block_id,
                User.is_active == True
            ).first()

        if active_warden:
            outing.status = OutingStatus.PENDING_WARDEN
        else:
            outing.status = OutingStatus.PENDING_WARDEN_ASSIGNMENT

        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=hod_user.id,
            actor_role=Role.HOD,
            action=ApprovalAction.HOD_APPROVED,
            comment=comment or ("Approved by HOD." if active_warden else "Approved by HOD. Awaiting Warden assignment for hostel block."),
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing


    @staticmethod
    def hod_reject(db: Session, outing_id: int, hod_user: User, comment: Optional[str] = None) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status != OutingStatus.PENDING_HOD:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"HOD can only process requests in PENDING_HOD status. Current status is '{outing.status}'."
            )

        outing.status = OutingStatus.REJECTED
        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=hod_user.id,
            actor_role=Role.HOD,
            action=ApprovalAction.HOD_REJECTED,
            comment=comment or "Rejected by HOD.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing

    @staticmethod
    def warden_confirm_parent(db: Session, outing_id: int, warden_user: User) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status not in [OutingStatus.PENDING_WARDEN, OutingStatus.PENDING_WARDEN_ASSIGNMENT]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Parent approval can only be confirmed for pending warden requests. Current status is '{outing.status}'."
            )

        outing.parent_approval_confirmed = True
        # If request was PENDING_WARDEN_ASSIGNMENT, update it to PENDING_WARDEN now that Warden is processing
        if outing.status == OutingStatus.PENDING_WARDEN_ASSIGNMENT:
            outing.status = OutingStatus.PENDING_WARDEN

        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=warden_user.id,
            actor_role=Role.WARDEN,
            action=ApprovalAction.PARENT_APPROVAL_CONFIRMED,
            comment="Parent approval confirmed by Warden.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing

    @staticmethod
    def warden_approve(db: Session, outing_id: int, warden_user: User, comment: Optional[str] = None) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status not in [OutingStatus.PENDING_WARDEN, OutingStatus.PENDING_WARDEN_ASSIGNMENT]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Warden can only approve pending requests. Current status is '{outing.status}'."
            )

        # MANDATORY CHECK: Parent approval MUST be explicitly confirmed before Warden final approval
        if not outing.parent_approval_confirmed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent approval has not been confirmed. Warden cannot give final approval without parent confirmation."
            )

        outing.status = OutingStatus.APPROVED
        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=warden_user.id,
            actor_role=Role.WARDEN,
            action=ApprovalAction.WARDEN_APPROVED,
            comment=comment or "Approved by Warden.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing

    @staticmethod
    def warden_reject(db: Session, outing_id: int, warden_user: User, comment: Optional[str] = None) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status not in [OutingStatus.PENDING_WARDEN, OutingStatus.PENDING_WARDEN_ASSIGNMENT]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Warden can only process pending requests. Current status is '{outing.status}'."
            )

        outing.status = OutingStatus.REJECTED
        db.commit()

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=warden_user.id,
            actor_role=Role.WARDEN,
            action=ApprovalAction.WARDEN_REJECTED,
            comment=comment or "Rejected by Warden.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing


    @staticmethod
    def watchman_record_exit(db: Session, outing_id: int, watchman_user: User) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status != OutingStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student is not authorized to leave the hostel."
            )

        now = datetime.now()

        # Check existing gate log
        existing_gate_log = db.query(GateLog).filter(GateLog.outing_id == outing.id).first()
        if existing_gate_log and existing_gate_log.exit_time is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exit has already been recorded for this outing."
            )

        outing.status = OutingStatus.EXITED
        db.commit()

        gate_log = GateLog(
            outing_id=outing.id,
            watchman_id=watchman_user.id,
            exit_time=now,
            status=GateStatus.EXIT_RECORDED
        )
        db.add(gate_log)

        history = ApprovalHistory(
            outing_id=outing.id,
            actor_id=watchman_user.id,
            actor_role=Role.WATCHMAN,
            action=ApprovalAction.EXIT_RECORDED,
            comment=f"Student exit recorded at gate by {watchman_user.name}.",
            timestamp=datetime.now()
        )
        db.add(history)
        db.commit()
        db.refresh(outing)
        return outing

    @staticmethod
    def watchman_record_return(db: Session, outing_id: int, watchman_user: User) -> OutingRequest:
        outing = db.query(OutingRequest).filter(OutingRequest.id == outing_id).first()
        if not outing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outing request not found.")

        if outing.status != OutingStatus.EXITED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return cannot be recorded before exit has been recorded."
            )

        gate_log = db.query(GateLog).filter(GateLog.outing_id == outing.id).first()
        if not gate_log or gate_log.exit_time is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exit record missing for this outing."
            )

        if gate_log.return_time is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return has already been recorded for this outing."
            )

        now = datetime.now()
        gate_log.return_time = now

        # Check if late return: compare actual return against expected return timestamp
        expected_dt = datetime.combine(outing.outing_date, outing.expected_return_time)
        is_late = now > expected_dt

        exp_str = outing.expected_return_time.strftime('%I:%M %p')
        act_str = now.strftime('%I:%M %p')

        if is_late:
            delay_sec = (now - expected_dt).total_seconds()
            delay_mins = max(1, int(round(delay_sec / 60.0)))
            gate_log.delay_minutes = delay_mins
            outing.status = OutingStatus.LATE_RETURN
            gate_log.status = GateStatus.LATE_RETURN
            history_action = ApprovalAction.LATE_RETURN_DETECTED
            comment = f"Expected Return: {exp_str} | Actual Return: {act_str} | Delay: {delay_mins} minutes"
        else:
            gate_log.delay_minutes = 0
            outing.status = OutingStatus.COMPLETED
            gate_log.status = GateStatus.COMPLETED
            history_action = ApprovalAction.COMPLETED
            if now < expected_dt:
                early_sec = (expected_dt - now).total_seconds()
                early_mins = int(round(early_sec / 60.0))
                if early_mins > 0:
                    comment = f"Student returned {early_mins} minute(s) early at {act_str}. Outing completed."
                else:
                    comment = f"Student returned on time at {act_str}. Outing completed."
            else:
                comment = f"Student returned on time at {act_str}. Outing completed."

        history_return = ApprovalHistory(
            outing_id=outing.id,
            actor_id=watchman_user.id,
            actor_role=Role.WATCHMAN,
            action=ApprovalAction.RETURN_RECORDED,
            comment=f"Student return recorded by {watchman_user.name}.",
            timestamp=datetime.now()
        )
        db.add(history_return)

        history_complete = ApprovalHistory(
            outing_id=outing.id,
            actor_id=watchman_user.id,
            actor_role=Role.WATCHMAN,
            action=history_action,
            comment=comment,
            timestamp=datetime.now()
        )
        db.add(history_complete)

        db.commit()
        db.refresh(outing)
        return outing

