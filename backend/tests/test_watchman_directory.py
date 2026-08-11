import pytest
from backend.tests.conftest import get_auth_header


def test_01_watchman_can_load_all_students(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    response = client.get("/api/watchman/students", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) >= 3

    # Check register numbers present
    reg_nums = [s["register_number"] for s in students]
    assert "CSE2027001" in reg_nums
    assert "ECE2027001" in reg_nums
    assert "CSE2027002" in reg_nums


def test_02_watchman_search_by_register_number(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    response = client.get("/api/watchman/students?search=CSE2027001", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) == 1
    assert students[0]["name"] == "Arjun Raj"


def test_03_watchman_search_by_outing_id(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    response = client.get("/api/watchman/students?search=1", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) >= 1


def test_04_watchman_filter_by_department(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    dept_id = seed_users["dept_ece"].id
    response = client.get(f"/api/watchman/students?department_id={dept_id}", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) == 1
    assert students[0]["name"] == "Nithya S"


def test_05_watchman_filter_by_hostel_block(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    block_c_id = seed_users["block_c"].id
    response = client.get(f"/api/watchman/students?hostel_block_id={block_c_id}", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) == 1
    assert students[0]["name"] == "Rahul Menon"


def test_06_non_watchman_cannot_access_student_directory(client, seed_users):
    for role_key in ["student1", "hod_cse", "warden_a"]:
        headers = get_auth_header(seed_users[role_key])
        res = client.get("/api/watchman/students", headers=headers)
        assert res.status_code == 403


def test_07_watchman_cannot_approve_or_reject_outings(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    res_app = client.post("/api/warden/outings/1/approve", json={"comment": "Illegal"}, headers=headers)
    assert res_app.status_code == 403

    res_rej = client.post("/api/hod/outings/1/reject", json={"comment": "Illegal"}, headers=headers)
    assert res_rej.status_code == 403


def test_08_invalid_search_returns_empty(client, seed_users):
    headers = get_auth_header(seed_users["watchman"])
    res = client.get("/api/watchman/students?search=NONEXISTENT999", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 0
