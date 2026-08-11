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
    Rebuilds development seed data deterministically and idempotently.
    Exactly 2 Departments, 3 Hostel Blocks, 9 Users, and 3 Workflow Outing Request Fixtures.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Clearing and re-seeding development database with clean authoritative dataset...")

        # Reset DB tables cleanly for fresh seed schema
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        hashed_password = get_password_hash("Hostel@123")

        # 1. Seed Departments (Exactly 2)
        dept_cse = Department(name="Computer Science and Engineering", code="CSE")
        dept_ece = Department(name="Electronics and Communication Engineering", code="ECE")
        db.add_all([dept_cse, dept_ece])
        db.commit()
        db.refresh(dept_cse)
        db.refresh(dept_ece)

        # 2. Seed Hostel Blocks (Exactly 3)
        block_a = HostelBlock(name="A Block")
        block_b = HostelBlock(name="B Block")
        block_c = HostelBlock(name="C Block")
        db.add_all([block_a, block_b, block_c])
        db.commit()
        db.refresh(block_a)
        db.refresh(block_b)
        db.refresh(block_c)

        # 3. Seed Students (Exactly 3 - One per Block)
        student_a = User(
            name="Arjun Raj",
            register_number="CSE2027001",
            email="student.a@hostelapp.local",
            password_hash=hashed_password,
            role=Role.STUDENT,
            department_id=dept_cse.id,
            hostel_block_id=block_a.id,
            year=3,
            hostel="A Block",
            room_number="A-101",
            is_active=True
        )
        student_b = User(
            name="Nithya S",
            register_number="ECE2027001",
            email="student.b@hostelapp.local",
            password_hash=hashed_password,
            role=Role.STUDENT,
            department_id=dept_ece.id,
            hostel_block_id=block_b.id,
            year=3,
            hostel="B Block",
            room_number="B-201",
            is_active=True
        )
        student_c = User(
            name="Rahul Menon",
            register_number="CSE2027002",
            email="student.c@hostelapp.local",
            password_hash=hashed_password,
            role=Role.STUDENT,
            department_id=dept_cse.id,
            hostel_block_id=block_c.id,
            year=3,
            hostel="C Block",
            room_number="C-301",
            is_active=True
        )
        db.add_all([student_a, student_b, student_c])

        # 4. Seed HODs (Exactly 2 - One per Department)
        hod_cse = User(
            name="Dr. Arun Kumar",
            email="hod.cse@hostelapp.local",
            password_hash=hashed_password,
            role=Role.HOD,
            department_id=dept_cse.id,
            is_active=True
        )
        hod_ece = User(
            name="Dr. Priya Sharma",
            email="hod.ece@hostelapp.local",
            password_hash=hashed_password,
            role=Role.HOD,
            department_id=dept_ece.id,
            is_active=True
        )
        db.add_all([hod_cse, hod_ece])

        # 5. Seed Wardens (Exactly 3 - One per Block)
        warden_a = User(
            name="Mr. Rajesh Kumar",
            email="warden.a@hostelapp.local",
            password_hash=hashed_password,
            role=Role.WARDEN,
            hostel_block_id=block_a.id,
            is_active=True
        )
        warden_b = User(
            name="Ms. Meena Krishnan",
            email="warden.b@hostelapp.local",
            password_hash=hashed_password,
            role=Role.WARDEN,
            hostel_block_id=block_b.id,
            is_active=True
        )
        warden_c = User(
            name="Mr. Suresh Kumar",
            email="warden.c@hostelapp.local",
            password_hash=hashed_password,
            role=Role.WARDEN,
            hostel_block_id=block_c.id,
            is_active=True
        )
        db.add_all([warden_a, warden_b, warden_c])

        # 6. Seed Watchman / Gate Officer (Exactly 1)
        watchman = User(
            name="Mr. Suresh B",
            email="watchman@hostelapp.local",
            password_hash=hashed_password,
            role=Role.WATCHMAN,
            is_active=True
        )
        db.add(watchman)

        db.commit()

        # Refresh instances
        for u in [student_a, student_b, student_c, hod_cse, hod_ece, warden_a, warden_b, warden_c, watchman]:
            db.refresh(u)

        today = date.today()

        # 7. Seed Outing Workflow Fixtures (Exactly 3 requests)

        # REQUEST 1: Arjun Raj (CSE / A Block) -> PENDING_HOD
        o1 = OutingRequest(
            student_id=student_a.id,
            outing_date=today + timedelta(days=1),
            leaving_time=time(14, 0),
            expected_return_time=time(18, 0),
            destination="City Central Library",
            reason="Reference textbooks for CSE algorithms project.",
            status=OutingStatus.PENDING_HOD,
            parent_approval_confirmed=False
        )
        db.add(o1)
        db.commit()
        db.refresh(o1)

        db.add(ApprovalHistory(
            outing_id=o1.id,
            actor_id=student_a.id,
            actor_role=Role.STUDENT,
            action=ApprovalAction.SUBMITTED,
            comment="Submitted CSE library outing request."
        ))

        # REQUEST 2: Nithya S (ECE / B Block) -> PENDING_WARDEN
        o2 = OutingRequest(
            student_id=student_b.id,
            outing_date=today + timedelta(days=2),
            leaving_time=time(10, 0),
            expected_return_time=time(16, 0),
            destination="Dental Clinic",
            reason="Wisdom tooth checkup appointment.",
            status=OutingStatus.PENDING_WARDEN,
            parent_approval_confirmed=False
        )
        db.add(o2)
        db.commit()
        db.refresh(o2)

        db.add_all([
            ApprovalHistory(
                outing_id=o2.id,
                actor_id=student_b.id,
                actor_role=Role.STUDENT,
                action=ApprovalAction.SUBMITTED,
                comment="Medical appointment request."
            ),
            ApprovalHistory(
                outing_id=o2.id,
                actor_id=hod_ece.id,
                actor_role=Role.HOD,
                action=ApprovalAction.HOD_APPROVED,
                comment="ECE HOD verified medical appointment."
            )
        ])

        # REQUEST 3: Rahul Menon (CSE / C Block) -> APPROVED
        o3 = OutingRequest(
            student_id=student_c.id,
            outing_date=today,
            leaving_time=time(9, 0),
            expected_return_time=time(17, 0),
            destination="Tech Conference",
            reason="Attending annual student developer conference.",
            status=OutingStatus.APPROVED,
            parent_approval_confirmed=True
        )
        db.add(o3)
        db.commit()
        db.refresh(o3)

        db.add_all([
            ApprovalHistory(
                outing_id=o3.id,
                actor_id=student_c.id,
                actor_role=Role.STUDENT,
                action=ApprovalAction.SUBMITTED,
                comment="Tech conference attendance."
            ),
            ApprovalHistory(
                outing_id=o3.id,
                actor_id=hod_cse.id,
                actor_role=Role.HOD,
                action=ApprovalAction.HOD_APPROVED,
                comment="Approved by CSE HOD."
            ),
            ApprovalHistory(
                outing_id=o3.id,
                actor_id=warden_c.id,
                actor_role=Role.WARDEN,
                action=ApprovalAction.PARENT_APPROVAL_CONFIRMED,
                comment="C Block Warden phoned parent; consent verified."
            ),
            ApprovalHistory(
                outing_id=o3.id,
                actor_id=warden_c.id,
                actor_role=Role.WARDEN,
                action=ApprovalAction.WARDEN_APPROVED,
                comment="Final approval granted by C Block Warden."
            )
        ])

        db.commit()
        print("Database successfully seeded with 2 departments, 3 blocks, 9 users, and 3 outing workflow fixtures!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
