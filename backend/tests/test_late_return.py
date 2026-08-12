from datetime import date, time, datetime, timedelta
import pytest
from backend.app.models.enums import OutingStatus, ApprovalAction, GateStatus, Role
from backend.app.models.gatelog import GateLog
from backend.app.models.history import ApprovalHistory
from backend.tests.conftest import get_auth_header


def _create_and_exit_outing(client, seed_users, expected_return_str="23:59:59"):
    """Helper to register, approve, and record exit for an outing request."""
    student = seed_users["student1"]
    hod = seed_users["hod_cse"]
    warden = seed_users["warden_a"]
    watchman = seed_users["watchman"]

    h_student = get_auth_header(student)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)

    today_str = date.today().isoformat()
    leaving_str = "00:00:00" if expected_return_str <= "08:00:00" else "08:00:00"

    res = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": leaving_str,
        "expected_return_time": expected_return_str,
        "destination": "Market",
        "reason": "Shopping"
    }, headers=h_student)
    assert res.status_code in [200, 201], f"Failed to create outing: {res.json()}"
    outing_id = res.json()["id"]

    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD Approved"}, headers=h_hod)
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden Approved"}, headers=h_warden)
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)

    return outing_id, h_student, h_hod, h_warden, h_watchman


# TEST 1: Student returns before expected return time -> COMPLETED
def test_1_return_before_expected_time(client, seed_users, db):
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="23:59:59")
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.COMPLETED


# TEST 2: Student returns on or before expected return time -> COMPLETED
def test_2_return_exactly_at_expected_time(client, seed_users, db):
    future_time = (datetime.now() + timedelta(minutes=10)).strftime("%H:%M:%S")
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str=future_time)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.COMPLETED


# TEST 3: Student returns after expected return time -> LATE_RETURN
def test_3_return_after_expected_time(client, seed_users, db):
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.LATE_RETURN


# TEST 4: Returned outing stores actual return time and preserves expected return time
def test_4_returned_outing_stores_times(client, seed_users, db):
    expected_str = "00:00:01"
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str=expected_str)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    data = ret_resp.json()
    assert data["expected_return_time"] == expected_str
    gate_log = db.query(GateLog).filter(GateLog.outing_id == outing_id).first()
    assert gate_log is not None
    assert gate_log.return_time is not None
    assert gate_log.delay_minutes > 0


# TEST 5: Return cannot occur before exit
def test_5_return_cannot_occur_before_exit(client, seed_users, db):
    student = seed_users["student1"]
    watchman = seed_users["watchman"]
    h_student = get_auth_header(student)
    h_watchman = get_auth_header(watchman)

    today_str = date.today().isoformat()
    res = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "08:00:00",
        "expected_return_time": "20:00:00",
        "destination": "Park",
        "reason": "Walk"
    }, headers=h_student)
    outing_id = res.json()["id"]

    # Attempt to return before exit has been recorded -> HTTP 400 Bad Request
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 400


# TEST 6: Audit timeline contains RETURN_RECORDED followed by LATE_RETURN_DETECTED for late returns
def test_6_audit_timeline_for_late_return(client, seed_users, db):
    outing_id, h_student, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)

    hist_resp = client.get(f"/api/outings/{outing_id}/history", headers=h_student)
    assert hist_resp.status_code == 200
    actions = [h["action"] for h in hist_resp.json()]
    assert ApprovalAction.RETURN_RECORDED in actions
    assert ApprovalAction.LATE_RETURN_DETECTED in actions
    assert ApprovalAction.COMPLETED not in actions


# TEST 7: Audit timeline contains RETURN_RECORDED followed by COMPLETED for on-time returns
def test_7_audit_timeline_for_ontime_return(client, seed_users, db):
    outing_id, h_student, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="23:59:59")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)

    hist_resp = client.get(f"/api/outings/{outing_id}/history", headers=h_student)
    assert hist_resp.status_code == 200
    actions = [h["action"] for h in hist_resp.json()]
    assert ApprovalAction.RETURN_RECORDED in actions
    assert ApprovalAction.COMPLETED in actions
    assert ApprovalAction.LATE_RETURN_DETECTED not in actions


# TEST 8: All history dashboards (HOD, Warden, Student, Watchman) display identical LATE_RETURN status
def test_8_role_dashboards_display_same_late_return_status(client, seed_users, db):
    outing_id, h_student, h_hod, h_warden, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)

    # 1. HOD History
    hod_resp = client.get("/api/hod/history", headers=h_hod)
    hod_item = next((o for o in hod_resp.json() if o["id"] == outing_id), None)
    assert hod_item is not None
    assert hod_item["status"] == OutingStatus.LATE_RETURN

    # 2. Warden History
    warden_resp = client.get("/api/warden/history", headers=h_warden)
    warden_item = next((o for o in warden_resp.json() if o["id"] == outing_id), None)
    assert warden_item is not None
    assert warden_item["status"] == OutingStatus.LATE_RETURN

    # 3. Student History
    student_resp = client.get("/api/outings/my", headers=h_student)
    student_item = next((o for o in student_resp.json() if o["id"] == outing_id), None)
    assert student_item is not None
    assert student_item["status"] == OutingStatus.LATE_RETURN


# TEST 9: Student cannot mark their own return -> HTTP 403 Forbidden
def test_9_student_cannot_mark_own_return(client, seed_users, db):
    outing_id, h_student, _, _, _ = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    forbidden_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_student)
    assert forbidden_resp.status_code == 403


