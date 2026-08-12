# REST API Reference Documentation

## Overview
**Hostel Outing Permission & Approval Management System**
This document provides the complete, authoritative API reference for the FastAPI backend service.

Base URL: `http://127.0.0.1:8000/api`

---

## Endpoint Summary Table

| Method | Endpoint | Allowed Role | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/auth/signup` | Public | Register new Student, HOD, or Warden account |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT access token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of authenticated user |
| `GET` | `/api/departments` | Public | List all academic departments |
| `GET` | `/api/hostel-blocks` | Public | List all hostel blocks |
| `POST` | `/api/outings` | `STUDENT` | Submit a new outing permission request |
| `GET` | `/api/outings/my` | `STUDENT` | List all outing requests submitted by logged-in student |
| `GET` | `/api/outings/{id}` | Scoped Roles | Retrieve specific outing details |
| `POST` | `/api/outings/{id}/cancel` | `STUDENT` | Cancel eligible pending outing request |
| `GET` | `/api/outings/{id}/history` | Scoped Roles | Fetch complete audit timeline for an outing request |
| `GET` | `/api/hod/outings/pending` | `HOD` | List pending requests for HOD's department (`PENDING_HOD`) |
| `GET` | `/api/hod/history` | `HOD` | Query department outing history with search & filters |
| `POST` | `/api/hod/outings/{id}/approve` | `HOD` | Approve student request (advance to `PENDING_WARDEN`) |
| `POST` | `/api/hod/outings/{id}/reject` | `HOD` | Reject student request (set to `REJECTED`) |
| `GET` | `/api/warden/outings/pending` | `WARDEN` | List pending requests for Warden's block (`PENDING_WARDEN`) |
| `GET` | `/api/warden/history` | `WARDEN` | Query hostel block outing history with search & filters |
| `POST` | `/api/warden/outings/{id}/parent-confirmation` | `WARDEN` | Confirm parent/guardian consent via phone call |
| `POST` | `/api/warden/outings/{id}/approve` | `WARDEN` | Grant final Warden approval (set to `APPROVED`) |
| `POST` | `/api/warden/outings/{id}/reject` | `WARDEN` | Reject student request at Warden stage |
| `GET` | `/api/watchman/outings/today` | `WATCHMAN` | List today's active gate outings |
| `GET` | `/api/watchman/outings/search` | `WATCHMAN` | Search gate outings by request ID, reg number, or name |
| `GET` | `/api/watchman/students` | `WATCHMAN` | Campus-wide student directory lookup |
| `POST` | `/api/watchman/outings/{id}/exit` | `WATCHMAN` | Record student gate exit (set to `EXITED`) |
| `POST` | `/api/watchman/outings/{id}/return` | `WATCHMAN` | Record student gate return (`COMPLETED` or `LATE_RETURN`) |

---

## Detailed Endpoint Specifications

### 1. System & Authentication Endpoints

#### 1.1 `GET /api/health`
- **Method**: `GET`
- **Authentication**: None
- **Purpose**: Health check endpoint.
- **Response** (`200 OK`):
  ```json
  {
    "status": "healthy",
    "service": "Hostel Outing Management API"
  }
  ```

#### 1.2 `POST /api/auth/signup`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Purpose**: Account registration for Students, HODs, and Wardens.
- **Request Body** (`SignupRequest`):
  ```json
  {
    "name": "Arjun Raj",
    "email": "student.a@hostelapp.local",
    "password": "Hostel@123",
    "confirm_password": "Hostel@123",
    "role": "STUDENT",
    "register_number": "CSE2027001",
    "department_id": 1,
    "hostel_block_id": 1,
    "year": 3,
    "room_number": "A-101"
  }
  ```
- **Response** (`201 Created` - `UserResponse`):
  ```json
  {
    "id": 1,
    "name": "Arjun Raj",
    "register_number": "CSE2027001",
    "email": "student.a@hostelapp.local",
    "role": "STUDENT",
    "department_id": 1,
    "hostel_block_id": 1,
    "year": 3,
    "hostel": "A Block",
    "room_number": "A-101",
    "is_active": true
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Password mismatch, invalid role, Watchman public signup attempt, duplicate email/register number, missing department/block ID, active HOD/Warden already assigned.

#### 1.3 `POST /api/auth/login`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Purpose**: Authenticate credentials and return JWT bearer token.
- **Request Body** (`LoginRequest`):
  ```json
  {
    "email": "student.a@hostelapp.local",
    "password": "Hostel@123"
  }
  ```
- **Response** (`200 OK` - `Token`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user_id": 1,
    "name": "Arjun Raj",
    "email": "student.a@hostelapp.local",
    "role": "STUDENT",
    "register_number": "CSE2027001",
    "department_id": 1,
    "department_code": "CSE",
    "department_name": "Computer Science and Engineering",
    "hostel_block_id": 1,
    "hostel_block_name": "A Block",
    "year": 3
  }
  ```
- **Possible Errors**:
  - `401 Unauthorized`: Invalid email or password.

#### 1.4 `GET /api/auth/me`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Purpose**: Get current user profile.
- **Response** (`200 OK` - `UserResponse`).

#### 1.5 `GET /api/departments`
- **Method**: `GET`
- **Authentication**: None
- **Purpose**: List all academic departments.
- **Response** (`200 OK` - List of `DepartmentResponse`):
  ```json
  [
    { "id": 1, "name": "Computer Science and Engineering", "code": "CSE" },
    { "id": 2, "name": "Electronics and Communication Engineering", "code": "ECE" }
  ]
  ```

#### 1.6 `GET /api/hostel-blocks`
- **Method**: `GET`
- **Authentication**: None
- **Purpose**: List all hostel blocks.
- **Response** (`200 OK` - List of `HostelBlockResponse`):
  ```json
  [
    { "id": 1, "name": "A Block" },
    { "id": 2, "name": "B Block" },
    { "id": 3, "name": "C Block" }
  ]
  ```

---

### 2. Student Outing Endpoints

#### 2.1 `POST /api/outings`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `STUDENT`
- **Purpose**: Submit a new outing permission request.
- **Request Body** (`OutingCreate`):
  ```json
  {
    "outing_date": "2026-08-15",
    "leaving_time": "09:00:00",
    "expected_return_time": "17:00:00",
    "destination": "City Library",
    "reason": "Research reference books."
  }
  ```
- **Response** (`201 Created` - `OutingResponse`):
  ```json
  {
    "id": 4,
    "student_id": 1,
    "outing_date": "2026-08-15",
    "leaving_time": "09:00:00",
    "expected_return_time": "17:00:00",
    "destination": "City Library",
    "reason": "Research reference books.",
    "status": "PENDING_HOD",
    "parent_approval_confirmed": false,
    "created_at": "2026-08-12T20:30:00",
    "updated_at": "2026-08-12T20:30:00"
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Outing date in past, leaving time after return time, active overlapping request exists.

#### 2.2 `GET /api/outings/my`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `STUDENT`
- **Purpose**: List outing requests created by the logged-in student.
- **Response** (`200 OK` - List of `OutingResponse`).

#### 2.3 `GET /api/outings/{id}`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: Scoped Roles (`STUDENT` can only access own outing; HOD/Warden/Watchman access scoped outings)
- **Path Parameter**: `id` (int) - Outing Request ID
- **Response** (`200 OK` - `OutingResponse`).
- **Possible Errors**:
  - `403 Forbidden`: Unauthorized cross-student or cross-department access attempt.
  - `404 Not Found`: Outing request does not exist.

#### 2.4 `POST /api/outings/{id}/cancel`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `STUDENT`
- **Path Parameter**: `id` (int)
- **Purpose**: Cancel a pending outing request (`PENDING_HOD` or `PENDING_WARDEN`).
- **Response** (`200 OK` - `OutingResponse` with `status: "CANCELLED"`).
- **Possible Errors**:
  - `400 Bad Request`: Request is already approved, rejected, exited, or completed.
  - `403 Forbidden`: Attempting to cancel another student's outing.

#### 2.5 `GET /api/outings/{id}/history`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: Scoped Roles
- **Path Parameter**: `id` (int)
- **Purpose**: Fetch chronological audit timeline for an outing request.
- **Response** (`200 OK` - List of `ApprovalHistoryResponse`):
  ```json
  [
    {
      "id": 1,
      "outing_id": 4,
      "actor_id": 1,
      "actor_name": "Arjun Raj",
      "actor_role": "STUDENT",
      "action": "SUBMITTED",
      "comment": "Outing request submitted by student.",
      "timestamp": "2026-08-12T20:30:00"
    }
  ]
  ```

---

### 3. HOD Endpoints

#### 3.1 `GET /api/hod/outings/pending`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `HOD`
- **Authorization Scope**: Department-scoped (`User.department_id == current_user.department_id`)
- **Purpose**: List pending requests (`PENDING_HOD`) for HOD's department.
- **Response** (`200 OK` - List of `OutingResponse`).

#### 3.2 `GET /api/hod/history`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `HOD`
- **Query Parameters**:
  - `search` (string, optional): Search by student name, register number, or outing ID `#OUT-X`.
  - `status_filter` (string, optional): Filter by `OutingStatus`.
  - `hostel_block_id` (int, optional): Filter by hostel block.
- **Response** (`200 OK` - List of `OutingResponse`).

#### 3.3 `POST /api/hod/outings/{id}/approve`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `HOD`
- **Path Parameter**: `id` (int)
- **Request Body** (`DecisionRequest`, optional):
  ```json
  { "comment": "Academic permission granted." }
  ```
- **Response** (`200 OK` - `OutingResponse` with `status: "PENDING_WARDEN"`).
- **Possible Errors**:
  - `400 Bad Request`: Outing not in `PENDING_HOD` status.
  - `403 Forbidden`: Request belongs to a student outside HOD's department.

#### 3.4 `POST /api/hod/outings/{id}/reject`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `HOD`
- **Path Parameter**: `id` (int)
- **Request Body** (`DecisionRequest`, optional):
  ```json
  { "comment": "Academic review rejected due to upcoming midterms." }
  ```
- **Response** (`200 OK` - `OutingResponse` with `status: "REJECTED"`).

---

### 4. Warden Endpoints

#### 4.1 `GET /api/warden/outings/pending`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `WARDEN`
- **Authorization Scope**: Hostel-block-scoped (`User.hostel_block_id == current_user.hostel_block_id`)
- **Purpose**: List pending requests (`PENDING_WARDEN`) for Warden's hostel block.
- **Response** (`200 OK` - List of `OutingResponse`).

#### 4.2 `GET /api/warden/history`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `WARDEN`
- **Query Parameters**:
  - `search` (string, optional)
  - `status_filter` (string, optional)
  - `department_id` (int, optional)
- **Response** (`200 OK` - List of `OutingResponse`).

#### 4.3 `POST /api/warden/outings/{id}/parent-confirmation`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `WARDEN`
- **Path Parameter**: `id` (int)
- **Purpose**: Mark parent/guardian consent confirmed via phone call.
- **Response** (`200 OK` - `OutingResponse` with `parent_approval_confirmed: true`).
- **Possible Errors**:
  - `400 Bad Request`: Outing not in pending warden status.
  - `403 Forbidden`: Request belongs to a student outside Warden's hostel block.

#### 4.4 `POST /api/warden/outings/{id}/approve`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `WARDEN`
- **Path Parameter**: `id` (int)
- **Request Body** (`DecisionRequest`, optional):
  ```json
  { "comment": "Parent phone confirmation received; final approval granted." }
  ```
- **Response** (`200 OK` - `OutingResponse` with `status: "APPROVED"`).
- **Possible Errors**:
  - `400 Bad Request`: Parent approval has not been confirmed (`parent_approval_confirmed == False`).

#### 4.5 `POST /api/warden/outings/{id}/reject`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `WARDEN`
- **Path Parameter**: `id` (int)
- **Request Body** (`DecisionRequest`, optional):
  ```json
  { "comment": "Parent declined permission." }
  ```
- **Response** (`200 OK` - `OutingResponse` with `status: "REJECTED"`).

---

### 5. Watchman Endpoints

#### 5.1 `GET /api/watchman/outings/today`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `WATCHMAN`
- **Purpose**: Retrieve active gate outings for today (`APPROVED`, `EXITED`, `COMPLETED`, `LATE_RETURN`).
- **Response** (`200 OK` - List of `OutingResponse`).

#### 5.2 `GET /api/watchman/outings/search`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `WATCHMAN`
- **Query Parameter**: `query` (string, required) - Search string
- **Response** (`200 OK` - List of `OutingResponse`).

#### 5.3 `GET /api/watchman/students`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Allowed Role**: `WATCHMAN`
- **Query Parameters**:
  - `search` (string, optional)
  - `department_id` (int, optional)
  - `hostel_block_id` (int, optional)
- **Response** (`200 OK` - List of `StudentDirectoryResponse`).

#### 5.4 `POST /api/watchman/outings/{id}/exit`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `WATCHMAN`
- **Path Parameter**: `id` (int)
- **Purpose**: Record student exit at main gate.
- **Response** (`200 OK` - `OutingResponse` with `status: "EXITED"`).
- **Possible Errors**:
  - `400 Bad Request`: Request status is not `APPROVED` or exit was already recorded.

#### 5.5 `POST /api/watchman/outings/{id}/return`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Allowed Role**: `WATCHMAN`
- **Path Parameter**: `id` (int)
- **Purpose**: Record student return at main gate and evaluate punctuality.
- **Response** (`200 OK` - `OutingResponse`):
  - **On-Time**: `status: "COMPLETED"`
  - **Late Return**: `status: "LATE_RETURN"` with delay minutes logged in `gate_log` and `LATE_RETURN_DETECTED` audit record.
- **Possible Errors**:
  - `400 Bad Request`: Return recorded before exit, or return already recorded.
