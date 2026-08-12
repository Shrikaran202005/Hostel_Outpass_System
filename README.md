# Hostel Outing Permission & Approval Management System

A production-grade full-stack web application designed for collegiate hostel administration. The system manages the lifecycle of student outing permissions through a multi-tier authorization workflow involving Students, Heads of Department (HOD), Hostel Wardens, and Main Gate Watchmen across multiple academic departments and hostel blocks.

---

## Problem

Collegiate residential institutions traditionally rely on manual paper outing slips, physical gate logbooks, and unverified phone calls. This legacy model introduces severe administrative flaws:
- Long approval delays and lost permission slips.
- Security vulnerabilities due to unverified parent consent.
- Inability for gate security officers to verify real-time permission status.
- Lack of automated tracking for late student returns.
- Absence of centralized, immutable audit records.

---

## Solution

The system provides a modern, digitised platform that automates outing requests and multi-level approvals while strictly enforcing role-based access control, department scoping, hostel block scoping, mandatory parent confirmation, gate movement logging, and automated Late Return Detection.

---

## Key Features

- **Multi-Role Authentication**: Role-isolated portals for `STUDENT`, `HOD`, `WARDEN`, and `WATCHMAN`.
- **Student Outing Requests**: Easy request creation with date/time validation and overlap prevention.
- **Department-Scoped HOD Approval**: Academic review restricted strictly to students within the HOD's department (`User.department_id`).
- **Hostel-Block-Scoped Warden Approval**: Residence review restricted strictly to students within the Warden's hostel block (`User.hostel_block_id`).
- **Mandatory Parent Confirmation**: Enforces explicit phone/in-person parent consent verification before Warden final approval (`parent_approval_confirmed == True`).
- **Gate Security Verification**: Searchable student directory and active outing desk for Watchmen at campus gates.
- **Gate Exit & Return Logging**: Single-click gate movement recording.
- **Automated Late Return Detection**: Compares actual return timestamps against expected return deadlines, automatically calculating delay minutes and marking `LATE_RETURN` without blocking student entry.
- **Immutable Audit History**: Complete timeline tracking for every status transition, actor action, comment, and timestamp.
- **Comprehensive Test Coverage**: 83 automated Pytest backend tests and Playwright E2E browser test scenarios.

---

## Roles & Responsibilities

| Role | Responsibility | Scope |
| :--- | :--- | :--- |
| **`STUDENT`** | Create requests, track approval status, cancel pending requests. | Own requests only |
| **`HOD`** | Evaluate academic validity, grant HOD approval or rejection. | Department-scoped (`User.department_id`) |
| **`WARDEN`** | Verify parent consent, grant final block clearance or rejection. | Hostel-block-scoped (`User.hostel_block_id`) |
| **`WATCHMAN`** | Campus gate security desk, student directory lookup, exit/return logging. | Campus-wide gate desk |

---

## Workflow Diagram

```text
Student Submits Outing Request (PENDING_HOD)
               │
               ▼
HOD Reviews & Grants Academic Clearance (PENDING_WARDEN)
               │
               ▼
Warden Verifies Parent Consent & Grants Final Approval (APPROVED)
               │
               ▼
Watchman Records Campus Gate Exit (EXITED)
               │
               ▼
Watchman Records Campus Gate Return
 ├── Actual Return <= Expected Return  ──► Status = COMPLETED
 └── Actual Return > Expected Return   ──► Status = LATE_RETURN (Delay Logged)
```

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLAlchemy 2.0 ORM, Python-Jose (JWT), Passlib (Bcrypt).
- **Database**: SQLite (development `hostel_outing.db`), PostgreSQL-compatible architecture.
- **Testing**: Pytest (83 test cases), Playwright (E2E testing), TypeScript strict compilation.

---

## Project Structure

```text
Hostel_Outpass_System/
├── hostel_outing.db                      # Primary SQLite Persistent Database
├── backend/                              # FastAPI Python Backend
│   ├── app/                              # Source Code (API, Auth, Database, Models, Schemas, Services)
│   ├── tests/                            # Backend Pytest Suite (83 test cases)
│   ├── seed_data.py                      # Idempotent Database Seeder
│   └── requirements.txt                      # Python Dependencies
├── frontend/                             # React TypeScript SPA
│   ├── src/                              # Source Code (Components, Pages, Services, Router)
│   ├── package.json                      # Node Dependencies & Scripts
│   └── vite.config.ts                    # Vite Configuration & Proxy Setup
├── e2e/                                  # Playwright End-to-End Test Suite
│   └── *.spec.ts                         # E2E Test Specifications
├── docs/                                 # Documentation Suite
│   ├── architecture.md                   # System Architecture Documentation
│   ├── design.md                         # Detailed System Design Documentation
│   ├── user-guide.md                     # End-User Manual
│   ├── api.md                            # Complete REST API Reference
│   └── setup.md                          # Setup, Execution & Troubleshooting Guide
└── evidence/                             # Test & Quality Reports
    ├── ai-change-loop.md                 # Stage 3 AI Development Loop Evidence
    └── red-run.md                        # Deliberate Defect Red-Run Report
```

---

## Documentation Links

- 📐 [Architecture Documentation](file:///c:/Data/Inter%20Assign/docs/architecture.md)
- 🎨 [Design Documentation](file:///c:/Data/Inter%20Assign/docs/design.md)
- 📘 [User Guide](file:///c:/Data/Inter%20Assign/docs/user-guide.md)
- 🔌 [REST API Reference](file:///c:/Data/Inter%20Assign/docs/api.md)
- 🛠️ [Setup & Installation Guide](file:///c:/Data/Inter%20Assign/docs/setup.md)

---

## Quickstart & Installation

See [docs/setup.md](file:///c:/Data/Inter%20Assign/docs/setup.md) for full instructions.

### 1. Start Backend
```powershell
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```

### 3. Access Application
Open `http://localhost:5173` in your browser.

---

## Development Demo Accounts

All demo accounts use the standard password: **`Hostel@123`**

| Role | Name | Email | Scope |
| :--- | :--- | :--- | :--- |
| **Student** | Arjun Raj | `student.a@hostelapp.local` | CSE / A Block |
| **Student** | Nithya S | `student.b@hostelapp.local` | ECE / B Block |
| **Student** | Rahul Menon | `student.c@hostelapp.local` | CSE / C Block |
| **HOD** | Dr. Arun Kumar | `hod.cse@hostelapp.local` | CSE Department |
| **HOD** | Dr. Priya Sharma | `hod.ece@hostelapp.local` | ECE Department |
| **Warden** | Mr. Rajesh Kumar | `warden.a@hostelapp.local` | A Block |
| **Warden** | Ms. Meena Krishnan | `warden.b@hostelapp.local` | B Block |
| **Warden** | Mr. Suresh Kumar | `warden.c@hostelapp.local` | C Block |
| **Watchman** | Mr. Suresh B | `watchman@hostelapp.local` | Main Gate Desk |

---

## Automated Testing

### Backend Pytest Suite (83 Passed)
```powershell
.\backend\venv\Scripts\pytest.exe -v
```

### Playwright E2E Suite
```powershell
cd e2e
npx playwright test
```

---

## 5-Minute Demonstration Walkthrough

1. **Student Request**: Log in as `student.a@hostelapp.local`, submit an outing request (`PENDING_HOD`).
2. **HOD Approval**: Log in as `hod.cse@hostelapp.local`, approve the request (`PENDING_WARDEN`).
3. **Warden Approval**: Log in as `warden.a@hostelapp.local`, confirm parent phone call, approve (`APPROVED`).
4. **Gate Exit**: Log in as `watchman@hostelapp.local`, search `CSE2027001`, click **Record Exit** (`EXITED`).
5. **Gate Return**: Click **Record Return**. System evaluates return time against expected return, sets status to `COMPLETED` or `LATE_RETURN`, logs delay minutes, and updates audit history.
