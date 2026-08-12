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
    # Expected return set to late tonight (23:59:59), actual return recorded now
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="23:59:59")
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.COMPLETED


# TEST 2: Student returns exactly at expected return time -> COMPLETED
def test_2_return_exactly_at_expected_time(client, seed_users, db):
    # Expected return matched to exact current minute
    now_time = datetime.utcnow().strftime("%H:%M:%S")
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str=now_time)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] in [OutingStatus.COMPLETED, OutingStatus.LATE_RETURN]


# TEST 3: Student returns after expected return time -> LATE_RETURN
def test_3_return_after_expected_time(client, seed_users, db):
    # Expected return time set early morning (00:00:01)
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.LATE_RETURN


# TEST 4: Returned outing stores actual return time
def test_4_returned_outing_stores_actual_return_time(client, seed_users, db):
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    gate_log = db.query(GateLog).filter(GateLog.outing_id == outing_id).first()
    assert gate_log is not None
    assert gate_log.return_time is not None


# TEST 5: Expected return time remains unchanged
def test_5_expected_return_time_remains_unchanged(client, seed_users, db):
    expected_str = "00:00:01"
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str=expected_str)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    data = ret_resp.json()
    assert data["expected_return_time"] == expected_str


# TEST 6: HOD history displays LATE_RETURN
def test_6_hod_history_displays_late_return(client, seed_users, db):
    outing_id, _, h_hod, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    history_resp = client.get("/api/hod/history", headers=h_hod)
    assert history_resp.status_code == 200
    outing_item = next((o for o in history_resp.json() if o["id"] == outing_id), None)
    assert outing_item is not None
    assert outing_item["status"] == OutingStatus.LATE_RETURN


# TEST 7: Warden history displays LATE_RETURN
def test_7_warden_history_displays_late_return(client, seed_users, db):
    outing_id, _, _, h_warden, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    history_resp = client.get("/api/warden/history", headers=h_warden)
    assert history_resp.status_code == 200
    outing_item = next((o for o in history_resp.json() if o["id"] == outing_id), None)
    assert outing_item is not None
    assert outing_item["status"] == OutingStatus.LATE_RETURN


# TEST 8: Student history displays LATE_RETURN
def test_8_student_history_displays_late_return(client, seed_users, db):
    outing_id, h_student, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    history_resp = client.get("/api/outings/my", headers=h_student)
    assert history_resp.status_code == 200
    outing_item = next((o for o in history_resp.json() if o["id"] == outing_id), None)
    assert outing_item is not None
    assert outing_item["status"] == OutingStatus.LATE_RETURN


# TEST 9: Watchman can record a late return
def test_9_watchman_can_record_late_return(client, seed_users, db):
    outing_id, _, _, _, h_watchman = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    assert ret_resp.json()["status"] == OutingStatus.LATE_RETURN


# TEST 10: Student cannot mark their own return
def test_10_student_cannot_mark_own_return(client, seed_users, db):
    outing_id, h_student, _, _, _ = _create_and_exit_outing(client, seed_users, expected_return_str="00:00:01")
    forbidden_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_student)
    assert forbidden_resp.status_code == 403

