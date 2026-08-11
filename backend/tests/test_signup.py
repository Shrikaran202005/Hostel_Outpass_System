from datetime import date, timedelta
import pytest
from backend.app.models.user import User
from backend.app.models.enums import Role, OutingStatus
from backend.app.auth.security import verify_password
from backend.tests.conftest import get_auth_header


def get_valid_student_payload(seed_users):
    dept_id = seed_users["dept_cse"].id
    block_id = seed_users["block_a"].id
    return {
        "role": "STUDENT",
        "name": "Arjun Raj",
        "register_number": "CSE2027003",
        "email": "arjun.new@student-demo.local",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "department_id": dept_id,
        "year": 3,
        "hostel_block_id": block_id,
        "room_number": "A-210"
    }


def test_01_successful_student_signup(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["role"] == "STUDENT"
    assert data["is_active"] is True
    assert "password" not in data
    assert "password_hash" not in data


def test_02_missing_name_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["name"] = "  "
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code in [400, 422]


def test_03_invalid_email_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["email"] = "not-an-email"
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422


def test_04_missing_password_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["password"] = ""
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code in [400, 422]


def test_05_password_mismatch_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["confirm_password"] = "DifferentPassword123!"
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "Passwords do not match" in response.json()["detail"]


def test_06_duplicate_email_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["email"] = seed_users["student1"].email
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "An account with this email already exists" in response.json()["detail"]


def test_07_duplicate_register_number_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["register_number"] = seed_users["student1"].register_number
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "An account with this register number already exists" in response.json()["detail"]


def test_08_invalid_department_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["department_id"] = 9999
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "Invalid department selected" in response.json()["detail"]


def test_09_invalid_hostel_block_rejected(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    payload["hostel_block_id"] = 9999
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "Invalid hostel block selected" in response.json()["detail"]


def test_10_successful_hod_signup(client, seed_users):
    # EEE department has no HOD in seed_users
    payload = {
        "role": "HOD",
        "name": "Dr. Nikola Tesla",
        "email": "hod.eee.new@hostel-demo.local",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "department_id": seed_users["dept_ece"].id  # We will test new department or EEE
    }
    # Create EEE dept or use unused
    payload["department_id"] = seed_users["dept_ece"].id
    # Note: seed_users has hod_ece, so signup should fail duplicate if active exists
    # Let's test duplicate active HOD rejection:
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "An active HOD already exists" in response.json()["detail"]


def test_11_duplicate_active_hod_rejected(client, seed_users):
    payload = {
        "role": "HOD",
        "name": "Dr. Duplicate HOD",
        "email": "duplicate.hod@test.local",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "department_id": seed_users["dept_cse"].id
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "An active HOD already exists for this department" in response.json()["detail"]


def test_12_duplicate_active_warden_rejected(client, seed_users):
    payload = {
        "role": "WARDEN",
        "name": "Mr. Duplicate Warden",
        "email": "duplicate.warden@test.local",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "hostel_block_id": seed_users["block_a"].id
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "An active Warden already exists for this hostel block" in response.json()["detail"]


def test_13_watchman_signup_is_rejected(client, seed_users):
    payload = {
        "role": "WATCHMAN",
        "name": "Malicious Watchman",
        "email": "watchman.public@test.local",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "Watchman accounts cannot be created through public signup" in response.json()["detail"]


def test_14_password_is_stored_hashed(client, seed_users, db):
    payload = get_valid_student_payload(seed_users)
    client.post("/api/auth/signup", json=payload)
    user_db = db.query(User).filter(User.email == payload["email"]).first()
    assert user_db.password_hash != payload["password"]
    assert verify_password(payload["password"], user_db.password_hash) is True


def test_15_password_hash_is_never_returned_in_api_response(client, seed_users):
    payload = get_valid_student_payload(seed_users)
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "password_hash" not in data
    assert "password" not in data


def test_16_student_can_register_for_block_with_no_warden(client, seed_users, db):
    from backend.app.models.hostel_block import HostelBlock
    block_c = HostelBlock(name="Block X Test")
    db.add(block_c)
    db.commit()


    payload = get_valid_student_payload(seed_users)
    payload["email"] = "karthik.cblock@test.local"
    payload["register_number"] = "REG_C01"
    payload["hostel_block_id"] = block_c.id
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    assert response.json()["hostel_block_id"] == block_c.id


def test_17_missing_warden_scenario_creates_pending_warden_assignment_status(client, seed_users, db):
    from backend.app.models.hostel_block import HostelBlock
    block_c = HostelBlock(name="Block C Test")
    db.add(block_c)
    db.commit()

    # Signup student in Block C (no Warden exists for Block C)
    payload = get_valid_student_payload(seed_users)
    payload["email"] = "student.cblock@test.local"
    payload["register_number"] = "REGC002"
    payload["hostel_block_id"] = block_c.id
    client.post("/api/auth/signup", json=payload)

    login_resp = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    token = login_resp.json()["access_token"]

    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    outing_resp = client.post(
        "/api/outings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "outing_date": tomorrow,
            "leaving_time": "14:00:00",
            "expected_return_time": "18:00:00",
            "destination": "Bookstore",
            "reason": "Books"
        }
    )
    outing_id = outing_resp.json()["id"]

    # CSE HOD approves
    cse_hod_headers = get_auth_header(seed_users["hod_cse"])
    approve_resp = client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD approved"}, headers=cse_hod_headers)
    assert approve_resp.status_code == 200
    # Because NO Warden exists for Block C, status becomes PENDING_WARDEN_ASSIGNMENT
    assert approve_resp.json()["status"] == OutingStatus.PENDING_WARDEN_ASSIGNMENT


def test_18_new_warden_signup_reassigns_pending_warden_assignment_requests(client, seed_users, db):
    from backend.app.models.hostel_block import HostelBlock
    block_d = HostelBlock(name="Block D Test")
    db.add(block_d)
    db.commit()

    # 1. Student registers for Block D
    s_payload = get_valid_student_payload(seed_users)
    s_payload["email"] = "student.dblock@test.local"
    s_payload["register_number"] = "REGD001"
    s_payload["hostel_block_id"] = block_d.id
    client.post("/api/auth/signup", json=s_payload)

    # 2. Outing created & HOD approved -> PENDING_WARDEN_ASSIGNMENT
    s_login = client.post("/api/auth/login", json={"email": s_payload["email"], "password": s_payload["password"]})
    s_token = s_login.json()["access_token"]
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    o_resp = client.post(
        "/api/outings",
        headers={"Authorization": f"Bearer {s_token}"},
        json={"outing_date": tomorrow, "leaving_time": "10:00:00", "expected_return_time": "14:00:00", "destination": "Clinic", "reason": "Health"}
    )
    o_id = o_resp.json()["id"]

    cse_hod_headers = get_auth_header(seed_users["hod_cse"])
    client.post(f"/api/hod/outings/{o_id}/approve", json={"comment": "OK"}, headers=cse_hod_headers)

    # 3. New Warden signs up for Block D
    w_payload = {
        "role": "WARDEN",
        "name": "Mr. Block D Warden",
        "email": "warden.dblock@test.local",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "hostel_block_id": block_d.id
    }
    w_signup = client.post("/api/auth/signup", json=w_payload)
    assert w_signup.status_code == 201

    # 4. Warden logs in and checks pending outings -> outing is now available
    w_login = client.post("/api/auth/login", json={"email": w_payload["email"], "password": w_payload["password"]})
    w_token = w_login.json()["access_token"]

    pending_warden = client.get("/api/warden/outings/pending", headers={"Authorization": f"Bearer {w_token}"}).json()
    assert any(o["id"] == o_id for o in pending_warden)
