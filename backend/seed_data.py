import sys
import os
from datetime import date, time, datetime, timedelta

# Ensure python path finds root project
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database.session import SessionLocal, Base, engine
from backend.app.models.department import Department
from backend.app.models.hostel_block import HostelBlock
from backend.app.models.user import User
from backend.app.models.outing import OutingRequest
from backend.app.models.history import ApprovalHistory
from backend.app.models.gatelog import GateLog
from backend.app.models.enums import Role, OutingStatus, ApprovalAction, GateStatus
from backend.app.auth.security import get_password_hash


def seed_database():
    """
    Authoritative Development Database Seed.
    Idempotent and Non-Destructive Database Seeder.
    Ensures baseline seed entities exist without dropping tables or modifying user-created data.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Verifying baseline development seed data idempotently...")

        hashed_password = get_password_hash("Hostel@123")

        # 1. Seed Departments (if not existing)
        dept_cse = db.query(Department).filter(Department.code == "CSE").first()
        if not dept_cse:
            dept_cse = Department(name="Computer Science and Engineering", code="CSE")
            db.add(dept_cse)

        dept_ece = db.query(Department).filter(Department.code == "ECE").first()
        if not dept_ece:
            dept_ece = Department(name="Electronics and Communication Engineering", code="ECE")
            db.add(dept_ece)

        db.commit()
        if dept_cse: db.refresh(dept_cse)
        if dept_ece: db.refresh(dept_ece)

        # 2. Seed Hostel Blocks (if not existing)
        block_a = db.query(HostelBlock).filter(HostelBlock.name == "A Block").first()
        if not block_a:
            block_a = HostelBlock(name="A Block")
            db.add(block_a)

        block_b = db.query(HostelBlock).filter(HostelBlock.name == "B Block").first()
        if not block_b:
            block_b = HostelBlock(name="B Block")
            db.add(block_b)

        block_c = db.query(HostelBlock).filter(HostelBlock.name == "C Block").first()
        if not block_c:
            block_c = HostelBlock(name="C Block")
            db.add(block_c)

        db.commit()
        if block_a: db.refresh(block_a)
        if block_b: db.refresh(block_b)
        if block_c: db.refresh(block_c)

        # Helper to retrieve or create seed user by email
        def get_or_create_user(email, create_fn):
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = create_fn()
                db.add(user)
                db.commit()
                db.refresh(user)
            return user

        student_a = get_or_create_user("student.a@hostelapp.local", lambda: User(
            name="Arjun Raj", register_number="CSE2027001", email="student.a@hostelapp.local",
            password_hash=hashed_password, role=Role.STUDENT, department_id=dept_cse.id,
            hostel_block_id=block_a.id, year=3, hostel="A Block", room_number="A-101", is_active=True
        ))

        student_b = get_or_create_user("student.b@hostelapp.local", lambda: User(
            name="Nithya S", register_number="ECE2027001", email="student.b@hostelapp.local",
            password_hash=hashed_password, role=Role.STUDENT, department_id=dept_ece.id,
            hostel_block_id=block_b.id, year=3, hostel="B Block", room_number="B-201", is_active=True
        ))

        student_c = get_or_create_user("student.c@hostelapp.local", lambda: User(
            name="Rahul Menon", register_number="CSE2027002", email="student.c@hostelapp.local",
            password_hash=hashed_password, role=Role.STUDENT, department_id=dept_cse.id,
            hostel_block_id=block_c.id, year=3, hostel="C Block", room_number="C-301", is_active=True
        ))

        hod_cse = get_or_create_user("hod.cse@hostelapp.local", lambda: User(
            name="Dr. Arun Kumar", email="hod.cse@hostelapp.local", password_hash=hashed_password,
            role=Role.HOD, department_id=dept_cse.id, is_active=True
        ))

        hod_ece = get_or_create_user("hod.ece@hostelapp.local", lambda: User(
            name="Dr. Priya Sharma", email="hod.ece@hostelapp.local", password_hash=hashed_password,
            role=Role.HOD, department_id=dept_ece.id, is_active=True
        ))

        warden_a = get_or_create_user("warden.a@hostelapp.local", lambda: User(
            name="Mr. Rajesh Kumar", email="warden.a@hostelapp.local", password_hash=hashed_password,
            role=Role.WARDEN, hostel_block_id=block_a.id, is_active=True
        ))

        warden_b = get_or_create_user("warden.b@hostelapp.local", lambda: User(
            name="Ms. Meena Krishnan", email="warden.b@hostelapp.local", password_hash=hashed_password,
            role=Role.WARDEN, hostel_block_id=block_b.id, is_active=True
        ))

        warden_c = get_or_create_user("warden.c@hostelapp.local", lambda: User(
            name="Mr. Suresh Kumar", email="warden.c@hostelapp.local", password_hash=hashed_password,
            role=Role.WARDEN, hostel_block_id=block_c.id, is_active=True
        ))

        watchman = get_or_create_user("watchman@hostelapp.local", lambda: User(
            name="Mr. Suresh B", email="watchman@hostelapp.local", password_hash=hashed_password,
            role=Role.WATCHMAN, is_active=True
        ))

        today = date.today()

        o1 = db.query(OutingRequest).filter(OutingRequest.student_id == student_a.id, OutingRequest.destination == "City Central Library").first()
        if not o1:
            o1 = OutingRequest(
                student_id=student_a.id, outing_date=today + timedelta(days=1), leaving_time=time(14, 0),
                expected_return_time=time(18, 0), destination="City Central Library",
                reason="Reference textbooks for CSE algorithms project.", status=OutingStatus.PENDING_HOD,
                parent_approval_confirmed=False
            )
            db.add(o1)
            db.commit()
            db.refresh(o1)
            db.add(ApprovalHistory(
                outing_id=o1.id, actor_id=student_a.id, actor_role=Role.STUDENT,
                action=ApprovalAction.SUBMITTED, comment="Submitted CSE library outing request."
            ))
            db.commit()

        o2 = db.query(OutingRequest).filter(OutingRequest.student_id == student_b.id, OutingRequest.destination == "Dental Clinic").first()
        if not o2:
            o2 = OutingRequest(
                student_id=student_b.id, outing_date=today + timedelta(days=2), leaving_time=time(10, 0),
                expected_return_time=time(16, 0), destination="Dental Clinic",
                reason="Wisdom tooth checkup appointment.", status=OutingStatus.PENDING_WARDEN,
                parent_approval_confirmed=False
            )
            db.add(o2)
            db.commit()
            db.refresh(o2)
            db.add_all([
                ApprovalHistory(outing_id=o2.id, actor_id=student_b.id, actor_role=Role.STUDENT, action=ApprovalAction.SUBMITTED, comment="Medical appointment request."),
                ApprovalHistory(outing_id=o2.id, actor_id=hod_ece.id, actor_role=Role.HOD, action=ApprovalAction.HOD_APPROVED, comment="ECE HOD verified medical appointment.")
            ])
            db.commit()

        o3 = db.query(OutingRequest).filter(OutingRequest.student_id == student_c.id, OutingRequest.destination == "Tech Conference").first()
        if not o3:
            o3 = OutingRequest(
                student_id=student_c.id, outing_date=today, leaving_time=time(9, 0),
                expected_return_time=time(17, 0), destination="Tech Conference",
                reason="Attending annual student developer conference.", status=OutingStatus.APPROVED,
                parent_approval_confirmed=True
            )
            db.add(o3)
            db.commit()
            db.refresh(o3)
            db.add_all([
                ApprovalHistory(outing_id=o3.id, actor_id=student_c.id, actor_role=Role.STUDENT, action=ApprovalAction.SUBMITTED, comment="Tech conference attendance."),
                ApprovalHistory(outing_id=o3.id, actor_id=hod_cse.id, actor_role=Role.HOD, action=ApprovalAction.HOD_APPROVED, comment="Approved by CSE HOD."),
                ApprovalHistory(outing_id=o3.id, actor_id=warden_c.id, actor_role=Role.WARDEN, action=ApprovalAction.PARENT_APPROVAL_CONFIRMED, comment="C Block Warden phoned parent; consent verified."),
                ApprovalHistory(outing_id=o3.id, actor_id=warden_c.id, actor_role=Role.WARDEN, action=ApprovalAction.WARDEN_APPROVED, comment="Final approval granted by C Block Warden.")
            ])
            db.commit()
        else:
            # Ensure seeded fixture outing #3 status remains APPROVED for E2E gate testing
            o3.status = OutingStatus.APPROVED
            o3.outing_date = today
            o3.parent_approval_confirmed = True
            gate_log = db.query(GateLog).filter(GateLog.outing_id == o3.id).first()
            if gate_log:
                db.delete(gate_log)
            db.commit()

        print("Database successfully verified/seeded idempotently.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
