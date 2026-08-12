# User Guide

## 1. Login

The system provides role-based authentication for four distinct roles:

- **Student**: Sign in using your college email (e.g., `student.a@hostelapp.local`) and password.
- **HOD (Head of Department)**: Sign in using your department HOD credentials (e.g., `hod.cse@hostelapp.local`).
- **Warden**: Sign in using your hostel block Warden credentials (e.g., `warden.a@hostelapp.local`).
- **Watchman (Gate Officer)**: Sign in using main gate credentials (`watchman@hostelapp.local`).

New Students, HODs, and Wardens can also register using the **Sign Up** option on the login page by selecting their corresponding role, department, and hostel block.

---

## 2. Student

### Outing Creation & Tracking
1. Log in with Student credentials.
2. Click **+ New Outing Request** on the Student Dashboard.
3. Provide:
   - **Outing Date**: Scheduled date of outing (cannot be in the past).
   - **Leaving Time**: Scheduled exit time.
   - **Expected Return Time**: Scheduled return time (must be after leaving time).
   - **Destination & Reason**: Purpose of outing.
4. Click **Submit Outing Request**. The status becomes `PENDING_HOD`.
5. View status updates on your dashboard cards (`PENDING_HOD`, `PENDING_WARDEN`, `APPROVED`, `EXITED`, `COMPLETED`, `LATE_RETURN`).
6. Click **View History** to see your complete personal outing history and audit logs. You can only view your own outing records.

---

## 3. HOD (Head of Department)

### Department Request Review
1. Log in with HOD credentials.
2. The HOD Dashboard displays all pending requests (`PENDING_HOD`) submitted by students in your specific department.
3. Review student register number, name, outing date, time, destination, and reason.
4. Click **Approve** to grant academic clearance. The request status advances to `PENDING_WARDEN`.
5. Click **Reject** to deny permission (rejection terminates the workflow with status `REJECTED`).
6. Navigate to **HOD History** (`/hod/history`) to inspect past department outings, filter by status or hostel block, and search by student name/ID. HODs cannot view students from other departments.

---

## 4. Warden

### Parent Confirmation & Final Approval
1. Log in with Warden credentials.
2. The Warden Dashboard displays all HOD-approved requests (`PENDING_WARDEN`) for students staying in your assigned hostel block.
3. **Mandatory Parent Verification**: Contact the student's parent/guardian via phone to verify consent.
4. Check the mandatory box: `[x] Parent Approval Confirmed`.
5. Click **Approve Outing** to grant final permission (`APPROVED`).
6. Click **Reject** if parent consent is denied or issues arise (`REJECTED`).
7. Navigate to **Warden History** (`/warden/history`) to view past block outings, track late returns, and search block records. Wardens cannot view students from other blocks.

---

## 5. Watchman (Gate Security)

### Student Directory & Gate Operations
1. Log in with Watchman credentials.
2. Use the **Search Bar** to lookup students by Register Number (e.g. `21CS101`), Student Name (e.g. `Rahul`), or Outing ID (`#OUT-1`).
3. Filter student directory list by Department or Hostel Block.
4. **Verifying Approval**: Ensure the student's current status is `APPROVED` before allowing gate exit.
5. **Recording Exit**: Click **Record Exit** when the student leaves campus. Status changes to `EXITED`, logging the exit timestamp.
6. **Recording Return**: Click **Record Return** when the student returns. Status updates to `COMPLETED` (on time) or `LATE_RETURN` (if actual return time exceeds expected return time).
7. View gate movement logs and student directory history at the gate desk.

---

## 6. Late Return Detection

The system automatically tracks student return compliance against scheduled expected return times:

- **Example Scenario**:
  - **Expected Return Time**: `17:00`
  - **Actual Return Time**: `17:35`
  - **Recorded Status**: `LATE_RETURN` (Delay: 35 minutes)

- **On-Time Scenario**:
  - **Expected Return Time**: `17:00`
  - **Actual Return Time**: `16:50`
  - **Recorded Status**: `COMPLETED`

> [!NOTE]
> A late student is NEVER blocked from entering campus. The Watchman records the return, and the system automatically logs the late return, calculates delay minutes, and updates audit records for HOD, Warden, and Student visibility.

---

## 7. History & Audit Scoping

Each user role has strict history visibility rules:

- **Student History**: Views only their own personal outing requests and gate logs.
- **HOD History**: Views outing records exclusively for students belonging to their department.
- **Warden History**: Views outing records exclusively for students residing in their hostel block.
- **Watchman Audit Desk**: Views campus-wide gate movement logs and student directory lookup.

---

## 8. Troubleshooting

| Symptom / Error | Cause | Resolution |
| :--- | :--- | :--- |
| **Invalid Login** | Incorrect email or password. | Re-verify credentials or register a new account via Sign Up. |
| **Unauthorized Access (HTTP 403)** | Role restricted endpoint access. | Ensure you are logged into the correct role dashboard. |
| **No Outing Found** | Invalid Register Number or Outing ID search query. | Check search query formatting (e.g. `#OUT-1` or `21CS101`). |
| **No Approval Error** | Watchman attempting to exit unapproved request. | Request must be approved by both HOD and Warden first. |
| **Already Exited Error** | Exit button clicked twice for same request. | Request is already in `EXITED` status; proceed to Record Return. |
| **Already Returned Error** | Return button clicked for completed request. | Request is already in `COMPLETED` or `LATE_RETURN` status. |

