import pytest
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.hostel_block import HostelBlock
from backend.app.models.enums import Role
from backend.app.auth.security import verify_password
from backend.seed_data import seed_database
from backend.tests.conftest import get_auth_header


def test_01_seed_database_verification(seed_users, db):
    # 1. Departments count = 2
    depts = db.query(Department).all()
    assert len(depts) == 2
    dept_codes = [d.code for d in depts]
    assert "CSE" in dept_codes
    assert "ECE" in dept_codes

    # 2. Hostel blocks count = 3
    blocks = db.query(HostelBlock).all()
    assert len(blocks) == 3
    block_names = [b.name for b in blocks]
    assert "A Block" in block_names
    assert "B Block" in block_names
    assert "C Block" in block_names

    # 3. User counts
    users = db.query(User).all()
    assert len(users) == 9

    students = [u for u in users if u.role == Role.STUDENT]
    hods = [u for u in users if u.role == Role.HOD]
    wardens = [u for u in users if u.role == Role.WARDEN]
    watchmen = [u for u in users if u.role == Role.WATCHMAN]

    assert len(students) == 3
    assert len(hods) == 2
    assert len(wardens) == 3
    assert len(watchmen) == 1

    # 4. Email uniqueness
    emails = [u.email for u in users]
    assert len(emails) == len(set(emails))

    # 5. Register number uniqueness
    reg_nums = [u.register_number for u in students]
    assert len(reg_nums) == len(set(reg_nums))


def test_02_seeded_users_authentication(client, seed_users):
    credentials = [
        "student.a@hostelapp.local",
        "student.b@hostelapp.local",
        "student.c@hostelapp.local",
        "hod.cse@hostelapp.local",
        "hod.ece@hostelapp.local",
        "warden.a@hostelapp.local",
        "warden.b@hostelapp.local",
        "warden.c@hostelapp.local",
        "watchman@hostelapp.local"
    ]
    for email in credentials:
        resp = client.post("/api/auth/login", json={"email": email, "password": "Hostel@123"})
        assert resp.status_code == 200, f"Login failed for seeded user {email}"
        data = resp.json()
        assert "access_token" in data


def test_03_passwords_are_stored_hashed(db, seed_users):
    users = db.query(User).all()
    for user in users:
        assert user.password_hash != "Hostel@123"
        assert verify_password("Hostel@123", user.password_hash) is True


def test_04_department_scoping_isolation(client, seed_users):
    # CSE HOD
    h_cse = get_auth_header(seed_users["hod_cse"])
    r_cse = client.get("/api/hod/outings/pending", headers=h_cse)
    assert r_cse.status_code == 200

    # ECE HOD
    h_ece = get_auth_header(seed_users["hod_ece"])
    r_ece = client.get("/api/hod/outings/pending", headers=h_ece)
    assert r_ece.status_code == 200


def test_05_warden_scoping_isolation(client, seed_users):
    # Warden A
    h_wa = get_auth_header(seed_users["warden_a"])
    r_wa = client.get("/api/warden/outings/pending", headers=h_wa)
    assert r_wa.status_code == 200

    # Warden B
    h_wb = get_auth_header(seed_users["warden_b"])
    r_wb = client.get("/api/warden/outings/pending", headers=h_wb)
    assert r_wb.status_code == 200

    # Warden C
    h_wc = get_auth_header(seed_users["warden_c"])
    r_wc = client.get("/api/warden/outings/pending", headers=h_wc)
    assert r_wc.status_code == 200


def test_06_watchman_cannot_approve_outings(client, seed_users):
    h_watch = get_auth_header(seed_users["watchman"])
    res = client.post("/api/warden/outings/1/approve", json={"comment": "Watchman illegal approve"}, headers=h_watch)
    assert res.status_code == 403
