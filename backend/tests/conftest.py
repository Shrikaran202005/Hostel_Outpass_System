import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.hostel_block import HostelBlock
from backend.app.models.enums import Role
from backend.app.auth.security import get_password_hash, create_access_token

# In-memory SQLite for isolated test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_users(db):
    hashed_pwd = get_password_hash("Hostel@123")

    # Departments (2)
    dept_cse = Department(name="Computer Science and Engineering", code="CSE")
    dept_ece = Department(name="Electronics and Communication Engineering", code="ECE")
    db.add_all([dept_cse, dept_ece])

    # Hostel Blocks (3)
    block_a = HostelBlock(name="A Block")
    block_b = HostelBlock(name="B Block")
    block_c = HostelBlock(name="C Block")
    db.add_all([block_a, block_b, block_c])
    db.commit()

    for d in [dept_cse, dept_ece]:
        db.refresh(d)
    for b in [block_a, block_b, block_c]:
        db.refresh(b)

    # 3 Students
    student1 = User(
        name="Arjun Raj",
        register_number="CSE2027001",
        email="student.a@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.STUDENT,
        department_id=dept_cse.id,
        hostel_block_id=block_a.id,
        year=3,
        hostel="A Block",
        room_number="A-101",
        is_active=True
    )
    student2 = User(
        name="Nithya S",
        register_number="ECE2027001",
        email="student.b@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.STUDENT,
        department_id=dept_ece.id,
        hostel_block_id=block_b.id,
        year=3,
        hostel="B Block",
        room_number="B-201",
        is_active=True
    )
    student3 = User(
        name="Rahul Menon",
        register_number="CSE2027002",
        email="student.c@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.STUDENT,
        department_id=dept_cse.id,
        hostel_block_id=block_c.id,
        year=3,
        hostel="C Block",
        room_number="C-301",
        is_active=True
    )

    # 2 HODs
    hod_cse = User(
        name="Dr. Arun Kumar",
        email="hod.cse@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.HOD,
        department_id=dept_cse.id,
        is_active=True
    )
    hod_ece = User(
        name="Dr. Priya Sharma",
        email="hod.ece@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.HOD,
        department_id=dept_ece.id,
        is_active=True
    )

    # 3 Wardens
    warden_a = User(
        name="Mr. Rajesh Kumar",
        email="warden.a@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.WARDEN,
        hostel_block_id=block_a.id,
        is_active=True
    )
    warden_b = User(
        name="Ms. Meena Krishnan",
        email="warden.b@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.WARDEN,
        hostel_block_id=block_b.id,
        is_active=True
    )
    warden_c = User(
        name="Mr. Suresh Kumar",
        email="warden.c@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.WARDEN,
        hostel_block_id=block_c.id,
        is_active=True
    )

    # 1 Watchman
    watchman = User(
        name="Mr. Suresh B",
        email="watchman@hostelapp.local",
        password_hash=hashed_pwd,
        role=Role.WATCHMAN,
        is_active=True
    )

    all_users = [student1, student2, student3, hod_cse, hod_ece, warden_a, warden_b, warden_c, watchman]
    db.add_all(all_users)
    db.commit()
    for u in all_users:
        db.refresh(u)

    return {
        "dept_cse": dept_cse,
        "dept_ece": dept_ece,
        "block_a": block_a,
        "block_b": block_b,
        "block_c": block_c,
        "student1": student1,
        "student2": student2,
        "student3": student3,
        "hod": hod_cse,
        "hod_cse": hod_cse,
        "hod_ece": hod_ece,
        "warden": warden_a,
        "warden_a": warden_a,
        "warden_b": warden_b,
        "warden_c": warden_c,
        "watchman": watchman
    }


def get_auth_header(user: User):
    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return {"Authorization": f"Bearer {token}"}
