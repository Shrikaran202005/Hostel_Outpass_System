<<<<<<< HEAD
# Hostel Outpass System
=======
<img width="1920" height="1080" alt="Screenshot (194)" src="https://github.com/user-attachments/assets/0057ba81-82f7-440d-8ca2-c9e33e415008" /># Hostel Outpass System
>>>>>>> 7e6cd309642f878d65690cbcb44758bfc85e5320

> **Smart Hostel Outing Permission & Gate Management System**
>
> A production-grade, full-stack web application designed to digitize, streamline, and secure the end-to-end hostel outing permission workflow, multi-level hierarchy approval process, gate entry/exit verification, and student movement tracking in educational institutions.

---

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Stateless_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

---

## 📋 Table of Contents

- [1. Project Introduction](#1-project-introduction)
  - [The Real-World Problem](#the-real-world-problem)
  - [The Digital Solution](#the-digital-solution)
  - [Why This Project?](#why-this-project)
- [2. Live Demo](#2-live-demo)
- [3. Project Highlights](#3-project-highlights)
- [4. User Roles & Responsibilities](#4-user-roles--responsibilities)
- [5. Complete Workflow](#5-complete-workflow)
- [6. System Architecture](#6-system-architecture)
- [7. Tech Stack](#7-tech-stack)
- [8. Database Design](#8-database-design)
- [9. Authentication & Security](#9-authentication--security)
- [10. API Documentation](#10-api-documentation)
- [11. Project Structure](#11-project-structure)
- [12. Local Setup Guide](#12-local-setup-guide)
- [13. Production Deployment](#13-production-deployment)
- [14. Environment Variables](#14-environment-variables)
- [15. Testing Suite](#15-testing-suite)
- [16. AI-Assisted Development Loop](#16-ai-assisted-development-loop)
- [17. Video Demo](#17-video-demo)
- [18. Screenshots](#18-screenshots)
- [19. Key Engineering Decisions](#19-key-engineering-decisions)
- [20. Challenges & Solutions](#20-challenges--solutions)
- [21. Future Enhancements](#21-future-enhancements)
- [22. Contribution Guide](#22-contribution-guide)
- [23. License](#23-license)
- [24. Author](#24-author)

---

## 1. Project Introduction

### The Real-World Problem

Hostel management in higher educational institutions handles thousands of student movements daily. Traditional permission procedures rely heavily on legacy manual systems plagued by:

- **Paper-Based Outing Forms:** Physical registers and handwritten slips easily get misplaced, damaged, or falsified.
- **Approval Bottlenecks:** Delayed offline communication between Students, Department Heads (HODs), and Hostel Wardens.
- **Unverified Gate Movement:** Security personnel (Watchmen) lack real-time access to verified approval records, leading to unauthorized exits or manual verification delays.
- **No Real-Time Tracking:** Inability to instantly identify active outings or calculate late return delays.
- **Audit Deficits:** Absence of tamper-proof historical logs for administrative review or parental reporting.

### The Digital Solution

The **Hostel Outpass System** introduces an end-to-end automated digital pipeline. Students initiate requests online, which dynamically route through a multi-tier approval hierarchy (HOD $\rightarrow$ Warden). Upon approval, security personnel at the physical campus gates verify outpasses digitally via dedicated security dashboards and log exact timestamped movement records.

### Why This Project?

- **Operational Efficiency:** Cuts permission turnaround time from hours to minutes.
- **Accountability & Safety:** Ensures student safety through verifiable parental/warden approvals and real-time gate logging.
- **Institutional Compliance:** Centralizes audit trails for administrative transparency and automated late-return monitoring.

---

## 2. Live Demo

Experience the live application deployed on production cloud infrastructure:

| Platform | Deployment Link | Description |
| :--- | :--- | :--- |
| 🚀 **Frontend App** | [hosteoutpass.netlify.app](https://hosteoutpass.netlify.app) | Production SPA hosted on Netlify |
| ⚡ **Backend REST API** | [hostel-outpass-system-iq9k.onrender.com](https://hostel-outpass-system-iq9k.onrender.com) | FastAPI REST API hosted on Render |
| 📚 **Interactive API Docs** | [hostel-outpass-system-iq9k.onrender.com/docs](https://hostel-outpass-system-iq9k.onrender.com/docs) | OpenAPI / Swagger documentation |
| 📖 **ReDoc Documentation** | [hostel-outpass-system-iq9k.onrender.com/redoc](https://hostel-outpass-system-iq9k.onrender.com/redoc) | Alternative ReDoc specification |

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Netlify-00C7B7?style=for-the-badge)](https://hosteoutpass.netlify.app)
[![API Docs](https://img.shields.io/badge/📚_API_Docs-Swagger-85EA2D?style=for-the-badge&logoColor=black)](https://hostel-outpass-system-iq9k.onrender.com/docs)
[![Video Demo](https://img.shields.io/badge/🎥_Video_Demo-Watch_Now-FF0000?style=for-the-badge&logo=youtube)](YOUTUBE_OR_GOOGLE_DRIVE_VIDEO_LINK)
[![Source Code](https://img.shields.io/badge/💻_Source_Code-GitHub-181717?style=for-the-badge&logo=github)](GITHUB_REPOSITORY_URL)

---

## 3. Project Highlights

- 🔐 **Role-Based Access Control (RBAC):** Strict role-isolated interfaces and API authorization for Students, HODs, Wardens, and Watchmen.
- 📝 **Outing Request Lifecycle:** Complete state machine handling `PENDING_HOD`, `PENDING_WARDEN`, `APPROVED`, `REJECTED`, `EXPIRED`, and `COMPLETED` states.
- 👨‍🏫 **HOD Academic Clearance:** Department-level verification ensuring academic schedule compliance prior to hostel authorization.
- 🏰 **Warden Hostel Approval & Parent Verification:** Hostel-block level validation incorporating parent consent confirmation steps.
- 🛂 **Watchman Gate Control System:** Real-time gate logging interface allowing security guards to record check-out (exit) and check-in (entry) with automated status updates.
- ⏱️ **Late Return Detection & Flagging:** Automated calculation comparing expected return timestamps against actual gate check-in timestamps.
- 📜 **Complete Audit & Gate History:** Full history logs capturing state transitions, approving actor IDs, role timestamps, and optional comments.
- ⚡ **Production Architecture:** Decoupled React frontend and FastAPI backend powered by PostgreSQL with client-side proxy routing.

---

## 4. User Roles & Responsibilities

| Role | Responsibilities & Capabilities |
| :--- | :--- |
| **Student** | Submit outing requests, specify destination/reason/dates, view approval status, track active outpasses, and inspect past outing history. |
| **HOD (Head of Dept)** | Inspect pending outing applications for students belonging strictly to their academic department; grant initial clearance or reject with comments. |
| **Warden** | Review HOD-cleared requests for students in their assigned hostel block; confirm parental consent; issue final approval or rejection. |
| **Watchman** | Scan/verify approved student outpasses at campus gates; execute real-time Check-Out (exit) and Check-In (entry) timestamp logging; flag late returns. |

---

## 5. Complete Workflow

```mermaid
flowchart TD
    A[Student Submits Outing Request] --> B{HOD Review}
    B -- Rejected --> C[Status: REJECTED_BY_HOD]
    B -- Approved --> D{Warden Review & Parent Verification}
    D -- Rejected --> E[Status: REJECTED_BY_WARDEN]
    D -- Approved --> F[Status: APPROVED / Outpass Active]
    F --> G[Student Arrives at Gate]
    G --> H[Watchman Verifies Outpass]
    H --> I[Check-Out Recorded / Exit Timestamp]
    I --> J[Student Returns to Gate]
    J --> K[Watchman Records Check-In / Entry Timestamp]
    K --> L{Returned On Time?}
    L -- Yes --> M[Status: COMPLETED]
    L -- No --> N[Status: COMPLETED_LATE / Flagged Late Return]
    M --> O[Outing & Gate Logs Archival]
    N --> O
```

### Process Description
1. **Request Creation:** The student fills out the outing form specifying departure date, expected return time, destination, and reason.
2. **Academic Verification:** The HOD inspects the request. Upon approval, status transitions to `PENDING_WARDEN`.
3. **Hostel Authorization:** The Warden confirms parental contact and approves the outpass (`APPROVED`).
4. **Gate Check-Out:** Security personnel locate the approved outpass at the gate and log the student's departure time (`CHECKED_OUT`).
5. **Gate Check-In:** Upon arrival back at campus, the Watchman logs the entry timestamp (`CHECKED_IN`). The system evaluates return timing and flags late returns automatically.

---

## 6. System Architecture

```mermaid
graph TD
    Client[Browser / React 18 SPA] <-->|HTTPS / JSON REST API| Netlify[Netlify CDN Hosting & Proxy]
    Netlify <-->|Forwards /api/*| Render[Render Web Service - FastAPI Backend]
    Render <-->|SQLAlchemy ORM| DB[(PostgreSQL Database)]
    
    subgraph Frontend Subsystem
        Netlify --- ReactRouter[React Router v6]
        Netlify --- Axios[Axios HTTP Client + Auth Interceptors]
        Netlify --- Tailwind[Tailwind CSS UI Component Layer]
    end
    
    subgraph Backend Subsystem
        Render --- Security[PyJWT + Password Hashing Module]
        Render --- Pydantic[Pydantic Validation Schemas]
        Render --- FastAPI[FastAPI APIRouter Modules]
    end
```

---

## 7. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Declarative component-based UI rendering |
| **Build Tool & Bundler** | Vite 5 | Fast development server & optimized production bundling |
| **Styling & Design** | Tailwind CSS 3 | Utility-first responsive styling system |
| **Routing** | React Router DOM v6 | Declarative client-side SPA route protection |
| **HTTP Client** | Axios | Async REST API requests with JWT Bearer interceptors |
| **Backend Framework** | FastAPI (Python 3.12) | High-performance async ASGI web framework |
| **Data Validation** | Pydantic v2 | Data parsing, type coercion, and strict schema validation |
| **ORM & Database** | SQLAlchemy 2.0 | Python SQL Toolkit and Object Relational Mapper |
| **Authentication** | PyJWT & Passlib (Bcrypt) | Stateless JWT authentication & password hashing |
| **Production Database** | PostgreSQL 16 | Relational database engine deployed on Render |
| **Local Database** | SQLite 3 | Zero-config database for local development fallback |
| **Hosting & Deployment** | Netlify & Render | Automated CI/CD web app & container hosting |

---

## 8. Database Design

```mermaid
erDiagram
    users ||--o{ outing_requests : "submits"
    users }o--|| departments : "belongs to"
    users }o--|| hostel_blocks : "assigned to"
    outing_requests ||--o{ approval_history : "tracks"
    outing_requests ||--o{ gate_logs : "logs movement"
    users ||--o{ approval_history : "acted by"
    users ||--o{ gate_logs : "verified by"

    users {
        int id PK
        string name
        string email
        string password_hash
        string role
        string register_number
        int department_id FK
        int hostel_block_id FK
        int year
        string room_number
        boolean is_active
    }

    departments {
        int id PK
        string name
        string code
    }

    hostel_blocks {
        int id PK
        string name
    }

    outing_requests {
        int id PK
        int student_id FK
        date outing_date
        time leaving_time
        time expected_return_time
        string destination
        string reason
        string status
        boolean parent_approval_confirmed
    }

    approval_history {
        int id PK
        int outing_id FK
        int actor_id FK
        string actor_role
        string action
        string comment
        datetime created_at
    }

    gate_logs {
        int id PK
        int outing_id FK
        int watchman_id FK
        datetime check_out_time
        datetime check_in_time
        string status
        boolean is_late
        int late_minutes
    }
```

### Entity Descriptions
- **`users`:** Stores system users across all roles (`STUDENT`, `HOD`, `WARDEN`, `WATCHMAN`).
- **`departments`:** Academic department records linked to students and HODs.
- **`hostel_blocks`:** Physical hostel buildings mapped to students and Wardens.
- **`outing_requests`:** Core outpass applications containing destination, schedule, and approval state.
- **`approval_history`:** Audit table recording every status transition, actor ID, and comment.
- **`gate_logs`:** Gate movement records storing check-out/check-in timestamps and late return calculations.

---

## 9. Authentication & Security

- **Stateless JWT Tokens:** Authentication is secured using HTTP Authorization header Bearer tokens signed with HMAC-SHA256 (`JWT_SECRET_KEY`).
- **Password Hashing:** Passwords are salted and hashed using standard `bcrypt` via Passlib prior to database insertion.
- **Role-Based Authorization (RBAC):** API endpoints enforce role verification decorators (`get_current_user`), preventing unauthorized cross-role access.
- **CORS Protection:** Configured cross-origin policies restrict unauthorized domains.
- **Secret Isolation:** Production secrets, database URI credentials, and signing keys are isolated inside environment variables (`.env`).

### Environment Template (`.env.example`)
```env
# Database Connection String
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_outing_db

# JWT Configuration
JWT_SECRET_KEY=your_secure_random_generated_jwt_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

---

## 10. API Documentation

Interactive API documentation is generated automatically by FastAPI at runtime:

- **Swagger UI:** [https://hostel-outpass-system-iq9k.onrender.com/docs](https://hostel-outpass-system-iq9k.onrender.com/docs)
- **ReDoc:** [https://hostel-outpass-system-iq9k.onrender.com/redoc](https://hostel-outpass-system-iq9k.onrender.com/redoc)

### Core Endpoint Summary

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | User authentication & JWT issuance |
| **Auth** | `POST` | `/api/auth/signup` | Public | Student, HOD, Warden registration |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Fetch current profile details |
| **Student**| `POST` | `/api/outings/` | Student | Submit new outing request |
| **Student**| `GET` | `/api/outings/my-requests` | Student | View student's outing history |
| **HOD** | `GET` | `/api/hod/pending-requests` | HOD | List department pending requests |
| **HOD** | `POST` | `/api/hod/approve/{id}` | HOD | Approve outing application |
| **Warden** | `GET` | `/api/warden/pending-requests` | Warden | List hostel block pending requests |
| **Warden** | `POST` | `/api/warden/approve/{id}` | Warden | Final approval & parent confirmation |
| **Watchman**| `GET` | `/api/watchman/active-outings` | Watchman | List active approved outpasses |
| **Watchman**| `POST` | `/api/watchman/check-out/{id}` | Watchman | Record gate exit timestamp |
| **Watchman**| `POST` | `/api/watchman/check-in/{id}` | Watchman | Record gate entry & late calculation |

---

## 11. Project Structure

```
Hostel_Outpass_System/
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── netlify.toml
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── requirements.txt
│   ├── seed_data.py
│   └── Dockerfile
├── docs/
│   ├── architecture.md
│   └── design.md
├── e2e/
│   ├── watchman_directory.spec.ts
│   └── role_history.spec.ts
├── evidence/
│   └── ai-change-loop.md
├── netlify.toml
├── render.yaml
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 12. Local Setup Guide

### Prerequisites
- **Python:** 3.12+
- **Node.js:** 18.x or 20.x
- **Git**

### Step 1: Clone Repository
```bash
git clone GITHUB_REPOSITORY_URL
cd Hostel_Outpass_System
```

### Step 2: Backend Setup
```bash
# Create Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp ../.env.example ../.env
```

### Step 4: Database Seeding & Startup
```bash
# Seed development database with initial departments, blocks, and demo accounts
python seed_data.py

# Start FastAPI Uvicorn Server
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API server will run at: `http://127.0.0.1:8000`  
Swagger UI available at: `http://127.0.0.1:8000/docs`

### Step 5: Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start Vite Development Server
npm run dev
```
Frontend web app will launch at: `http://localhost:5173`

---

## 13. Production Deployment

```mermaid
graph LR
    User[Client Browser] -->|HTTPS| Netlify[Netlify CDN - React SPA]
    Netlify -->|Rewrites /api/*| Render[Render Web Service - FastAPI Backend]
    Render -->|PostgreSQL Protocol| RenderDB[(Render PostgreSQL Database)]
```

- **Frontend (Netlify):** Deployed from `frontend/` directory using Vite build outputs (`dist`). SPA routes are handled via `_redirects` and `netlify.toml`.
- **Backend (Render):** Deployed as a Python Web Service running `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.
- **Database (Render PostgreSQL):** Managed PostgreSQL instance connected securely via `DATABASE_URL`.

---

## 14. Environment Variables

| Variable | Purpose | Example / Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy Database URI | `postgresql://user:pass@host/db` or `sqlite:///./hostel_outing.db` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | `random_32_byte_hex_string` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration duration in minutes | `1440` (24 Hours) |
| `HOST` | Server bind host address | `0.0.0.0` |
| `PORT` | Server listener port | `8000` |
| `VITE_API_URL` | Frontend API base endpoint URL | `https://hostel-outpass-system-iq9k.onrender.com` |

---

## 15. Testing Suite

The repository includes backend integration tests and Playwright End-to-End (E2E) testing specs:

### Running Backend Unit & Integration Tests
```bash
pytest
```

### Running Playwright End-to-End Tests
```bash
npx playwright test
```

### Test Coverage Areas
- **Authentication & RBAC:** Ensures invalid passwords, unauthenticated routes, and cross-role unauthorized access are rejected.
- **Workflow State Transitions:** Validates `PENDING_HOD` $\rightarrow$ `PENDING_WARDEN` $\rightarrow$ `APPROVED` pipeline integrity.
- **Gate Entry / Exit Logging:** Verifies check-out and check-in timestamping and late-return calculation logic.

---

## 16. AI-Assisted Development Loop

This application was engineered using a structured **AI-Assisted Engineering Workflow**, maintaining high code quality through continuous verification cycles:

```mermaid
flowchart TD
    A[Existing Working Application] --> B[New Feature Requirement e.g., Late Return Detection]
    B --> C[AI-Assisted Code & Schema Implementation]
    C --> D[Execute Automated Verification / Test Suite]
    D -- Tests Fail --> E[Analyze Failure & Root Cause Logs]
    E --> F[AI-Assisted Refactoring & Bug Resolution]
    F --> D
    D -- All Tests Pass --> G[Deploy Verified Production Feature]
```

### Example Iteration: Late Return Detection
During implementation of automated late return calculation:
1. **Requirement:** Flag students returning past `expected_return_time` and record delay duration in minutes.
2. **Verification:** Automated tests identified a timezone offset bug when comparing time objects against datetime timestamps.
3. **Refactoring:** Standardized UTC timestamp comparisons in `gate_logs` service layer, resolving test regressions cleanly.

---

## 17. Video Demo

Watch the complete demonstration of the system in action:

🎥 **[Watch Full Video Demonstration](YOUTUBE_OR_GOOGLE_DRIVE_VIDEO_LINK)**

### Featured Workflow Demonstrations:
1. **Student Login & Submission:** Creating an outpass request.
2. **HOD Approval:** Departmental review and approval.
3. **Warden Approval & Parent Verification:** Final hostel block authorization.
4. **Watchman Gate Operation:** Gate check-out and check-in timestamping.
5. **Audit History & Late Return Flagging:** Instant visual indicators for delayed entry.

---

## 18. Screenshots

### Login Page
![Login Page](Public/login.png)

### Student Dashboard
![Student Dashboard](Public/student-dashboard.png)

### HOD Dashboard
![HOD Dashboard](Public/hod-dashboard.png)

### Warden Dashboard
![Warden Dashboard](Public/warden-dashboard.png)

### Watchman Gate Dashboard
![Watchman Dashboard](Public/watchman-dashboard.png)

### Gate Movement Logs
![Gate Logs](Public/gate-logs.png)

---

## 19. Key Engineering Decisions

- **React 18 + Vite:** Selected for high-speed client-side rendering, instant HMR during development, and minimal production bundle footprint.
- **FastAPI Framework:** Chosen for automatic OpenAPI documentation, high performance async request execution, and native Pydantic validation.
- **Stateless JWT Authorization:** Eliminates server-side session lookup overhead, allowing easy horizontal scaling of backend services.
- **Database Abstraction (SQLAlchemy ORM):** Enables seamless switching between SQLite for fast local development and PostgreSQL for production.
- **Reverse Proxy Architecture:** Using Netlify rewrites for `/api/*` eliminates cross-origin preflight overhead (CORS) in production environments.

---

## 20. Challenges & Solutions

| Challenge | Technical Solution |
| :--- | :--- |
| **Manual Paper Bottlenecks** | Digitized state machine pipeline with role-scoped dashboards (`PENDING_HOD` $\rightarrow$ `PENDING_WARDEN` $\rightarrow$ `APPROVED`). |
| **Role Isolation & Security** | Implemented JWT authorization middleware enforcing granular role permission checks on every protected API endpoint. |
| **Real-time Gate Verification** | Built specialized Watchman gate views listing active approved outpasses for instantaneous exit/entry logging. |
| **Late Return Monitoring** | Added automated timestamp difference calculation in gate logging service to flag delayed returns. |
| **CORS & SPA Route 404 Errors** | Configured Netlify `_redirects` proxying `/api/*` to Render and mapping fallback routes to `/index.html`. |

---

## 21. Future Enhancements

- 📱 **Mobile App (Flutter / React Native):** Dedicated iOS and Android app for gate QR scanning.
- 📲 **SMS / WhatsApp Parent Alerts:** Automated notification to parents upon Warden approval and gate check-out.
- 🔲 **Dynamic QR Code Outpasses:** Unique time-sensitive QR code generation on student outpasses for zero-touch gate scanning.
- 📊 **Administrative Analytics Dashboard:** Visual insights on outing trends, peak exit hours, and department-wise late return stats.
- 🔔 **Real-Time Push Notifications:** Web push notifications informing students immediately when their request status updates.

---

## 22. Contribution Guide

Contributions are welcome! Follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes:**
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push to the Branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 23. License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 24. Author

**Shrikaran**  
*B.Tech in Computer Science and Engineering*  
SRM Institute of Science and Technology (POY of 2027)

- 🐙 **GitHub:** [github.com/Shrikaran202005](https://github.com/Shrikaran202005)
- 💼 **LinkedIn:** [LINKEDIN_LINK](https://www.linkedin.com/in/shrikaran-p/)
- 🌐 **Portfolio:** [PORTFOLIO_LINK](https://shrikaran.netlify.app/)
- 📧 **Email:** [EMAIL](shrikaran2017@gmail.com)

---

<div align="center">

⭐ **If you found this project useful or interesting, please consider giving it a star on GitHub!** ⭐

</div>
