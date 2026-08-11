from datetime import date, timedelta
from backend.tests.conftest import get_auth_header
from backend.app.models.enums import OutingStatus


def test_cse_hod_can_access_cse_and_cannot_access_ece(client, seed_users):
    student1 = seed_users["student1"]  # CSE
    student2 = seed_users["student2"]  # ECE
    hod_cse = seed_users["hod_cse"]
    hod_ece = seed_users["hod_ece"]

    h_student1 = get_auth_header(student1)
    h_student2 = get_auth_header(student2)
    h_hod_cse = get_auth_header(hod_cse)
    h_hod_ece = get_auth_header(hod_ece)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    # CSE student creates outing
    res_cse = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "CSE Tech Fair",
        "reason": "Academic Project Presentation"
    }, headers=h_student1)
    outing_cse_id = res_cse.json()["id"]

    # ECE student creates outing
    res_ece = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "ECE Lab",
        "reason": "Robotics Competition"
    }, headers=h_student2)
    outing_ece_id = res_ece.json()["id"]

    # CSE HOD pending list should ONLY contain CSE outing
    pending_cse_hod = client.get("/api/hod/outings/pending", headers=h_hod_cse).json()
    cse_ids = [o["id"] for o in pending_cse_hod]
    assert outing_cse_id in cse_ids
    assert outing_ece_id not in cse_ids

    # CSE HOD can access CSE outing details
    detail_cse = client.get(f"/api/hod/outings/{outing_cse_id}", headers=h_hod_cse)
    assert detail_cse.status_code == 200

    # CSE HOD CANNOT access ECE outing details (returns 403 Forbidden)
    detail_ece_unauth = client.get(f"/api/hod/outings/{outing_ece_id}", headers=h_hod_cse)
    assert detail_ece_unauth.status_code == 403
    assert "HOD is not authorized to access outings for other departments" in detail_ece_unauth.json()["detail"]

    # CSE HOD CANNOT approve ECE outing (returns 403 Forbidden)
    approve_unauth = client.post(f"/api/hod/outings/{outing_ece_id}/approve", json={"comment": "Cross dept test"}, headers=h_hod_cse)
    assert approve_unauth.status_code == 403

    # CSE HOD CANNOT reject ECE outing (returns 403 Forbidden)
    reject_unauth = client.post(f"/api/hod/outings/{outing_ece_id}/reject", json={"comment": "Cross dept test"}, headers=h_hod_cse)
    assert reject_unauth.status_code == 403


def test_warden_block_scoping(client, seed_users):
    student1 = seed_users["student1"]  # Block A
    student2 = seed_users["student2"]  # Block B
    hod_cse = seed_users["hod_cse"]
    hod_ece = seed_users["hod_ece"]
    warden_a = seed_users["warden_a"]  # Block A
    warden_b = seed_users["warden_b"]  # Block B

    h_student1 = get_auth_header(student1)
    h_student2 = get_auth_header(student2)
    h_hod_cse = get_auth_header(hod_cse)
    h_hod_ece = get_auth_header(hod_ece)
    h_warden_a = get_auth_header(warden_a)
    h_warden_b = get_auth_header(warden_b)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    # Create & HOD approve for Block A student
    res_a = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Block A Trip",
        "reason": "Reason A"
    }, headers=h_student1)
    id_a = res_a.json()["id"]
    client.post(f"/api/hod/outings/{id_a}/approve", json={"comment": "HOD OK"}, headers=h_hod_cse)

    # Create & HOD approve for Block B student
    res_b = client.post("/api/outings", json={
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Block B Trip",
        "reason": "Reason B"
    }, headers=h_student2)
    id_b = res_b.json()["id"]
    client.post(f"/api/hod/outings/{id_b}/approve", json={"comment": "HOD OK"}, headers=h_hod_ece)

    # Warden A pending list should ONLY contain Block A request
    pending_warden_a = client.get("/api/warden/outings/pending", headers=h_warden_a).json()
    block_a_ids = [o["id"] for o in pending_warden_a]
    assert id_a in block_a_ids
    assert id_b not in block_a_ids

    # Warden A CANNOT access Block B outing (returns 403)
    detail_b_unauth = client.get(f"/api/warden/outings/{id_b}", headers=h_warden_a)
    assert detail_b_unauth.status_code == 403

    # Warden A CANNOT confirm parent approval for Block B outing (returns 403)
    confirm_unauth = client.post(f"/api/warden/outings/{id_b}/parent-confirmation", json={"parent_approval_confirmed": True}, headers=h_warden_a)
    assert confirm_unauth.status_code == 403

    # Warden A CANNOT approve Block B outing (returns 403)
    approve_unauth = client.post(f"/api/warden/outings/{id_b}/approve", json={"comment": "Illegal approval"}, headers=h_warden_a)
    assert approve_unauth.status_code == 403

    # Warden B CANNOT approve Block A outing (returns 403)
    approve_a_unauth = client.post(f"/api/warden/outings/{id_a}/approve", json={"comment": "Illegal approval"}, headers=h_warden_b)
    assert approve_a_unauth.status_code == 403


def test_student_cannot_manually_choose_hod_or_warden(client, seed_users):
    student1 = seed_users["student1"]
    h_student = get_auth_header(student1)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    # Outing payload does not accept HOD or Warden IDs; backend automatically routes based on user profile
    payload = {
        "outing_date": tomorrow,
        "leaving_time": "10:00:00",
        "expected_return_time": "14:00:00",
        "destination": "Bookstore",
        "reason": "Study supplies",
        "hod_id": 999,  # Malicious attempt to pick HOD
        "warden_id": 999  # Malicious attempt to pick Warden
    }
    res = client.post("/api/outings", json=payload, headers=h_student)
    assert res.status_code == 201
    outing = res.json()
    # Ensure status starts at PENDING_HOD for student's own department HOD automatically
    assert outing["status"] == OutingStatus.PENDING_HOD
