from datetime import date, timedelta
import pytest
from backend.tests.conftest import get_auth_header
from backend.app.models.enums import OutingStatus, ApprovalAction, GateStatus
from backend.app.models.outing import OutingRequest
from backend.app.models.gatelog import GateLog
from backend.app.models.history import ApprovalHistory


def test_01_student_login_works(client, seed_users):
    response = client.post("/api/auth/login", json={"email": "student.a@hostelapp.local", "password": "Hostel@123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "STUDENT"
    assert data["register_number"] == "CSE2027001"


def test_02_invalid_login_fails(client, seed_users):
    response = client.post("/api/auth/login", json={"email": "student.a@hostelapp.local", "password": "WrongPassword"})
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]



def test_03_student_can_create_outing(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload = {
        "outing_date": tomorrow,
        "leaving_time": "14:00:00",
        "expected_return_time": "18:00:00",
        "destination": "Bookstore",
        "reason": "Buying reference material"
    }
    response = client.post("/api/outings", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == OutingStatus.PENDING_HOD
    assert data["destination"] == "Bookstore"

    # Verify audit trail
    hist_resp = client.get(f"/api/outings/{data['id']}/history", headers=headers)
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 1
    assert history[0]["action"] == ApprovalAction.SUBMITTED


def test_04_past_date_rejected(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    payload = {
        "outing_date": yesterday,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "City Market",
        "reason": "Personal work"
    }
    response = client.post("/api/outings", json=payload, headers=headers)
    assert response.status_code == 400
    assert "cannot be in the past" in response.json()["detail"]


def test_05_invalid_time_range_rejected(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload = {
        "outing_date": tomorrow,
        "leaving_time": "18:00:00",
        "expected_return_time": "14:00:00",  # Return before leaving
        "destination": "Library",
        "reason": "Study"
    }
    response = client.post("/api/outings", json=payload, headers=headers)
    assert response.status_code == 400
    assert "Leaving time must be strictly before expected return time" in response.json()["detail"]


def test_06_missing_destination_rejected(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload = {
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "",
        "reason": "Study"
    }
    response = client.post("/api/outings", json=payload, headers=headers)
    assert response.status_code == 422  # Pydantic validation error


def test_07_missing_reason_rejected(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload = {
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Mall",
        "reason": ""
    }
    response = client.post("/api/outings", json=payload, headers=headers)
    assert response.status_code == 422


def test_08_duplicate_overlapping_outing_rejected(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload1 = {
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Mall",
        "reason": "Shopping"
    }
    resp1 = client.post("/api/outings", json=payload1, headers=headers)
    assert resp1.status_code == 201

    payload2 = {
        "outing_date": tomorrow,
        "leaving_time": "12:00:00",  # Overlaps with 10:00 - 14:00
        "expected_return_time": "16:00:00",
        "destination": "Cinema",
        "reason": "Movie"
    }
    resp2 = client.post("/api/outings", json=payload2, headers=headers)
    assert resp2.status_code == 400
    assert "overlaps" in resp2.json()["detail"]


def test_09_student_can_see_own_outings(client, seed_users):
    student1 = seed_users["student1"]
    headers = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Bank",
        "reason": "ATM withdrawal"
    }, headers=headers)

    response = client.get("/api/outings/my", headers=headers)
    assert response.status_code == 200
    outings = response.json()
    assert len(outings) >= 1
    assert outings[0]["destination"] == "Bank"


def test_10_student_cannot_see_another_students_private_outing(client, seed_users, db):
    student1 = seed_users["student1"]
    student2 = seed_users["student2"]
    headers1 = get_auth_header(student1)
    headers2 = get_auth_header(student2)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Private Destination",
        "reason": "Private Reason"
    }, headers=headers1)
    outing_id = resp.json()["id"]

    # Student 2 tries to access Student 1's outing
    resp_unauth = client.get(f"/api/outings/{outing_id}", headers=headers2)
    assert resp_unauth.status_code == 403
    assert "Access denied" in resp_unauth.json()["detail"]


def test_11_hod_can_approve(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Clinic",
        "reason": "Doctor visit"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    approve_resp = client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "Verified by HOD"}, headers=h_hod)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == OutingStatus.PENDING_WARDEN


def test_12_hod_can_reject(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Gaming zone",
        "reason": "Entertainment"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    reject_resp = client.post(f"/api/hod/outings/{outing_id}/reject", json={"comment": "Reason not valid"}, headers=h_hod)
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == OutingStatus.REJECTED


def test_13_hod_rejection_stops_workflow(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Arcade",
        "reason": "Fun"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/reject", json={"comment": "Rejected"}, headers=h_hod)

    # Warden pending list should NOT include this rejected request
    warden_pending = client.get("/api/warden/outings/pending", headers=h_warden).json()
    assert all(o["id"] != outing_id for o in warden_pending)

    # Warden attempting to approve rejected request should fail
    warden_approve_resp = client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Try approve"}, headers=h_warden)
    assert warden_approve_resp.status_code == 400


def test_14_hod_cannot_approve_already_processed_request(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Hospital",
        "reason": "Health check"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "First approval"}, headers=h_hod)

    # Second approval attempt must fail
    second_approve = client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "Second approval"}, headers=h_hod)
    assert second_approve.status_code == 400
    assert "PENDING_HOD" in second_approve.json()["detail"]


def test_15_only_hod_approved_requests_reach_warden(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Hardware store",
        "reason": "Project components"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    # Before HOD approval, Warden pending list does not have it
    warden_pending_before = client.get("/api/warden/outings/pending", headers=h_warden).json()
    assert all(o["id"] != outing_id for o in warden_pending_before)

    # Approve by HOD
    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "OK"}, headers=h_hod)

    # After HOD approval, Warden pending list has it
    warden_pending_after = client.get("/api/warden/outings/pending", headers=h_warden).json()
    assert any(o["id"] == outing_id for o in warden_pending_after)


def test_16_warden_cannot_approve_without_parent_confirmation(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Optician",
        "reason": "Eye glasses"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD approved"}, headers=h_hod)

    # Warden tries to approve WITHOUT parent confirmation
    approve_resp = client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Direct approve attempt"}, headers=h_warden)
    assert approve_resp.status_code == 400
    assert "Parent approval has not been confirmed" in approve_resp.json()["detail"]


def test_17_parent_confirmation_is_stored_in_history(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Home visit",
        "reason": "Family event"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD approved"}, headers=h_hod)

    confirm_resp = client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["parent_approval_confirmed"] is True

    # Verify in history
    hist = client.get(f"/api/outings/{outing_id}/history", headers=h_warden).json()
    actions = [h["action"] for h in hist]
    assert ApprovalAction.PARENT_APPROVAL_CONFIRMED in actions


def test_18_warden_can_approve_after_parent_confirmation(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Stationary",
        "reason": "Exam prep"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)

    approve_resp = client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Parent verified and approved"}, headers=h_warden)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == OutingStatus.APPROVED


def test_19_warden_can_reject(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Out of city",
        "reason": "Personal travel"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    reject_resp = client.post(f"/api/warden/outings/{outing_id}/reject", json={"comment": "Parent denied consent"}, headers=h_warden)
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == OutingStatus.REJECTED


def test_20_rejected_request_cannot_reach_watchman(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Park",
        "reason": "Walk"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/reject", json={"comment": "No"}, headers=h_hod)

    today_list = client.get("/api/watchman/outings/today", headers=h_watchman).json()
    assert all(o["id"] != outing_id for o in today_list)


def test_21_watchman_cannot_record_exit_for_unapproved_outing(client, seed_users):
    student1 = seed_users["student1"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_watchman = get_auth_header(watchman)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "12:00:00",
        "destination": "Mall",
        "reason": "Shopping"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    # Pending HOD status
    exit_resp = client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)
    assert exit_resp.status_code == 400
    assert "Student is not authorized to leave the hostel" in exit_resp.json()["detail"]


def test_22_watchman_can_record_exit_for_approved_outing(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Bank",
        "reason": "Draft submission"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)

    exit_resp = client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)
    assert exit_resp.status_code == 200
    assert exit_resp.json()["status"] == OutingStatus.EXITED


def test_23_exit_creates_gate_log(client, seed_users, db):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Post Office",
        "reason": "Courier"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)

    gate_log = db.query(GateLog).filter(GateLog.outing_id == outing_id).first()
    assert gate_log is not None
    assert gate_log.exit_time is not None
    assert gate_log.status == GateStatus.EXIT_RECORDED


def test_24_exit_creates_history_record(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Medical store",
        "reason": "Medicine"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)

    hist = client.get(f"/api/outings/{outing_id}/history", headers=h_watchman).json()
    actions = [h["action"] for h in hist]
    assert ApprovalAction.EXIT_RECORDED in actions


def test_25_return_cannot_happen_before_exit(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Cafe",
        "reason": "Coffee"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)

    # Attempt to return WITHOUT exiting first
    return_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert return_resp.status_code == 400
    assert "Return cannot be recorded before exit" in return_resp.json()["detail"]


def test_26_watchman_can_record_return(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "23:59:00",
        "destination": "Project Lab",
        "reason": "Hardware testing"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)

    return_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert return_resp.status_code == 200
    assert return_resp.json()["status"] in [OutingStatus.COMPLETED, OutingStatus.LATE_RETURN]


def test_27_return_creates_history(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "23:59:00",
        "destination": "College Ground",
        "reason": "Sports practice"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)

    hist = client.get(f"/api/outings/{outing_id}/history", headers=h_watchman).json()
    actions = [h["action"] for h in hist]
    assert ApprovalAction.RETURN_RECORDED in actions


def test_28_completed_status_is_correct(client, seed_users):
    student1 = seed_users["student1"]
    hod = seed_users["hod"]
    warden = seed_users["warden"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student1)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)
    today_str = date.today().isoformat()

    create_resp = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "10:00:00",
        "expected_return_time": "23:59:00",
        "destination": "Book store",
        "reason": "Buy notebook"
    }, headers=h_student)
    outing_id = create_resp.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)

    assert ret_resp.json()["status"] == OutingStatus.COMPLETED


def test_29_unauthorized_role_access_is_rejected(client, seed_users):
    student1 = seed_users["student1"]
    h_student = get_auth_header(student1)

    # Student trying to access HOD endpoint
    hod_resp = client.get("/api/hod/outings/pending", headers=h_student)
    assert hod_resp.status_code == 403

    # Student trying to access Warden endpoint
    warden_resp = client.get("/api/warden/outings/pending", headers=h_student)
    assert warden_resp.status_code == 403

    # Student trying to access Watchman exit endpoint
    watchman_resp = client.post("/api/watchman/outings/1/exit", headers=h_student)
    assert watchman_resp.status_code == 403


def test_30_history_cannot_be_modified_by_normal_user_endpoints(client, seed_users):
    student1 = seed_users["student1"]
    h_student = get_auth_header(student1)

    # No PUT, POST, DELETE routes exist for approval history endpoint
    put_resp = client.put("/api/outings/1/history", json={"comment": "hacked"}, headers=h_student)
    assert put_resp.status_code == 405  # Method not allowed

    del_resp = client.delete("/api/outings/1/history", headers=h_student)
    assert del_resp.status_code == 405  # Method not allowed
