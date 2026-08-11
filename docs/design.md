# Database Design & API Schema Documentation

## 1. Database Entity-Relationship Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : belongs_to
    HOSTEL_BLOCKS ||--o{ USERS : resides_in
    USERS ||--o{ OUTING_REQUESTS : raises
    USERS ||--o{ APPROVAL_HISTORY : acts
    USERS ||--o{ GATE_LOGS : records
    OUTING_REQUESTS ||--o{ APPROVAL_HISTORY : tracks
    OUTING_REQUESTS ||--o{ GATE_LOGS : logs

    DEPARTMENTS {
        int id PK
        string name
        string code UK
    }

    HOSTEL_BLOCKS {
        int id PK
        string name UK
    }

    USERS {
        int id PK
        string name
        string register_number UK
        string email UK
        string password_hash
        enum role
        int department_id FK
        int hostel_block_id FK
        int year
        string hostel
        string room_number
        boolean is_active
        datetime created_at
    }

    OUTING_REQUESTS {
        int id PK
        int student_id FK
        date outing_date
        time leaving_time
        time expected_return_time
        string destination
        string reason
        enum status
        boolean parent_approval_confirmed
        datetime created_at
    }

    APPROVAL_HISTORY {
        int id PK
        int outing_id FK
        int actor_id FK
        enum actor_role
        enum action
        string comment
        datetime timestamp
    }

    GATE_LOGS {
        int id PK
        int outing_id FK
        int watchman_id FK
        datetime exit_time
        datetime return_time
        enum status
        datetime created_at
    }
```

---

## 2. Authorization Rules & Scoping Matrix

| Endpoint | Role | Authorization Constraint | Unauthorized Access Behavior |
| :--- | :--- | :--- | :--- |
| `GET /api/hod/outings/pending` | HOD | Filters to `student.department_id == current_user.department_id` | Returns empty list for other departments |
| `GET/POST /api/hod/outings/{id}/*` | HOD | Verifies `student.department_id == current_user.department_id` | `HTTP 403 Forbidden` |
| `GET /api/warden/outings/pending` | WARDEN | Filters to `student.hostel_block_id == current_user.hostel_block_id` | Returns empty list for other blocks |
| `GET/POST /api/warden/outings/{id}/*` | WARDEN | Verifies `student.hostel_block_id == current_user.hostel_block_id` | `HTTP 403 Forbidden` |
| `POST /api/watchman/outings/{id}/exit` | WATCHMAN | Verifies `status == APPROVED` | `HTTP 400 Bad Request` ("Student is not authorized to leave") |
| `POST /api/watchman/outings/{id}/return` | WATCHMAN | Verifies `status == EXITED` | `HTTP 400 Bad Request` ("Return cannot be recorded before exit") |
