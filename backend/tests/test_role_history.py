import pytest
from datetime import date, time
from backend.app.models.outing import OutingRequest
from backend.app.models.enums import OutingStatus
from backend.tests.conftest import get_auth_header


@pytest.fixture
def seed_outings(db, seed_users):
    outing1 = OutingRequest(
        student_id=seed_users["student1"].id,
        outing_date=date.today(),
        leaving_time=time(9, 0),
        expected_return_time=time(17, 0),
        destination="Shopping Mall",
        reason="Personal Work",
        status=OutingStatus.COMPLETED,
        parent_approval_confirmed=True
    )
    outing2 = OutingRequest(
        student_id=seed_users["student2"].id,
        outing_date=date.today(),
        leaving_time=time(10, 0),
        expected_return_time=time(18, 0),
        destination="ECE Seminar",
        reason="Academic Workshop",
        status=OutingStatus.APPROVED,
        parent_approval_confirmed=True
    )
    outing3 = OutingRequest(
        student_id=seed_users["student3"].id,
        outing_date=date.today(),
        leaving_time=time(8, 30),
        expected_return_time=time(16, 0),
        destination="Tech Conference",
        reason="Conference presentation",
        status=OutingStatus.COMPLETED,
        parent_approval_confirmed=True
    )
    db.add_all([outing1, outing2, outing3])
    db.commit()
    db.refresh(outing1)
    db.refresh(outing2)
    db.refresh(outing3)
    return [outing1, outing2, outing3]


def test_01_cse_hod_sees_only_cse_history(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["hod_cse"])
    response = client.get("/api/hod/history", headers=headers)
    assert response.status_code == 200
    outings = response.json()

    # Arjun Raj (CSE) and Rahul Menon (CSE) should be present
    student_names = [o["student"]["name"] for o in outings if o.get("student")]
    assert "Arjun Raj" in student_names
    assert "Rahul Menon" in student_names
    # Nithya S (ECE) must NOT be present
    assert "Nithya S" not in student_names


def test_02_ece_hod_sees_only_ece_history(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["hod_ece"])
    response = client.get("/api/hod/history", headers=headers)
    assert response.status_code == 200
    outings = response.json()

    student_names = [o["student"]["name"] for o in outings if o.get("student")]
    assert "Nithya S" in student_names
    assert "Arjun Raj" not in student_names
    assert "Rahul Menon" not in student_names


def test_03_warden_a_sees_only_block_a_history(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["warden_a"])
    response = client.get("/api/warden/history", headers=headers)
    assert response.status_code == 200
    outings = response.json()

    student_names = [o["student"]["name"] for o in outings if o.get("student")]
    assert "Arjun Raj" in student_names
    assert "Rahul Menon" not in student_names  # Rahul is C Block
    assert "Nithya S" not in student_names    # Nithya is B Block


def test_04_warden_c_sees_only_block_c_history(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["warden_c"])
    response = client.get("/api/warden/history", headers=headers)
    assert response.status_code == 200
    outings = response.json()

    student_names = [o["student"]["name"] for o in outings if o.get("student")]
    assert "Rahul Menon" in student_names
    assert "Arjun Raj" not in student_names
    assert "Nithya S" not in student_names


def test_05_cross_role_access_denied(client, seed_users, seed_outings):
    # Student cannot access HOD or Warden history
    student_headers = get_auth_header(seed_users["student1"])
    assert client.get("/api/hod/history", headers=student_headers).status_code == 403
    assert client.get("/api/warden/history", headers=student_headers).status_code == 403

    # HOD cannot access Warden history
    hod_headers = get_auth_header(seed_users["hod_cse"])
    assert client.get("/api/warden/history", headers=hod_headers).status_code == 403

    # Warden cannot access HOD history
    warden_headers = get_auth_header(seed_users["warden_a"])
    assert client.get("/api/hod/history", headers=warden_headers).status_code == 403


def test_06_hod_search_respects_authorization(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["hod_cse"])
    
    # CSE HOD searching for ECE reg number ECE2027001
    res = client.get("/api/hod/history?search=ECE2027001", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 0

    # CSE HOD searching for CSE reg number CSE2027001
    res_valid = client.get("/api/hod/history?search=CSE2027001", headers=headers)
    assert res_valid.status_code == 200
    assert len(res_valid.json()) >= 1
    assert res_valid.json()[0]["student"]["name"] == "Arjun Raj"


def test_07_warden_search_respects_authorization(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["warden_c"])

    # C Block Warden searching for A Block student Arjun
    res = client.get("/api/warden/history?search=Arjun", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 0

    # C Block Warden searching for C Block student Rahul
    res_valid = client.get("/api/warden/history?search=Rahul", headers=headers)
    assert res_valid.status_code == 200
    assert len(res_valid.json()) >= 1
    assert res_valid.json()[0]["student"]["name"] == "Rahul Menon"


def test_08_hod_filters_respect_scope(client, seed_users, seed_outings):
    headers = get_auth_header(seed_users["hod_cse"])
    
    # Status filter
    res_stat = client.get("/api/hod/history?status_filter=COMPLETED", headers=headers)
    assert res_stat.status_code == 200

    # Block filter
    block_c_id = seed_users["block_c"].id
    res_block = client.get(f"/api/hod/history?hostel_block_id={block_c_id}", headers=headers)
    assert res_block.status_code == 200
    for o in res_block.json():
        assert o["student"]["department_id"] == seed_users["hod_cse"].department_id
