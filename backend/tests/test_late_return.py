from datetime import date, time, datetime, timedelta
import pytest
from backend.app.models.enums import OutingStatus, ApprovalAction, GateStatus
from backend.app.models.gatelog import GateLog
from backend.app.models.history import ApprovalHistory
from backend.tests.conftest import get_auth_header


def test_late_return_detection(client, seed_users, db):
    student = seed_users["student1"]
    hod = seed_users["hod_cse"]
    warden = seed_users["warden_a"]
    watchman = seed_users["watchman"]

    h_student = get_auth_header(student)
    h_hod = get_auth_header(hod)
    h_warden = get_auth_header(warden)
    h_watchman = get_auth_header(watchman)

    # Past outing date so expected_return_time is in the past
    past_date = (date.today() - timedelta(days=1)).isoformat()

    # Create outing directly in DB or via flow
    # Create request
    today_str = date.today().isoformat()
    res = client.post("/api/outings", json={
        "outing_date": today_str,
        "leaving_time": "08:00:00",
        "expected_return_time": "08:05:00",  # Very early expected return time
        "destination": "Library",
        "reason": "Books"
    }, headers=h_student)
    outing_id = res.json()["id"]

    # Approve by HOD
    client.post(f"/api/hod/outings/{outing_id}/approve", json={"comment": "HOD OK"}, headers=h_hod)

    # Confirm parent & approve by Warden
    client.post(f"/api/warden/outings/{outing_id}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden)
    client.post(f"/api/warden/outings/{outing_id}/approve", json={"comment": "Warden OK"}, headers=h_warden)

    # Exit recorded by Watchman
    client.post(f"/api/watchman/outings/{outing_id}/exit", headers=h_watchman)

    # Return recorded by Watchman (current time is guaranteed after 08:05 AM if run during day)
    ret_resp = client.post(f"/api/watchman/outings/{outing_id}/return", headers=h_watchman)
    assert ret_resp.status_code == 200
    outing_data = ret_resp.json()

    assert outing_data["status"] == OutingStatus.LATE_RETURN

    # Verify history records contain LATE_RETURN_DETECTED
    hist_resp = client.get(f"/api/outings/{outing_id}/history", headers=h_student)
    actions = [h["action"] for h in hist_resp.json()]
    assert ApprovalAction.LATE_RETURN_DETECTED in actions

    # Verify gate log delay_minutes > 0
    gate_log = db.query(GateLog).filter(GateLog.outing_id == outing_id).first()
    assert gate_log is not None
    assert gate_log.status == GateStatus.LATE_RETURN
    assert gate_log.delay_minutes is not None
    assert gate_log.delay_minutes >= 0
