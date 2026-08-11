# Hostel Outing System - User Guide

Welcome to the **Hostel Outing Permission & Approval System**. This guide provides step-by-step instructions for each role in the hostel administration workflow.

---

## 1. Student Guide

### Raising an Outing Request
1. Sign in with your student credentials (`student@example.com`).
2. Click the **+ New Outing Request** button on the Student Dashboard.
3. Select your **Outing Date**, **Leaving Time**, and **Expected Return Time**.
4. Enter the **Destination** and **Reason for Outing**.
5. Click **Submit Request**. Your request will immediately enter status `PENDING_HOD`.

### Tracking & Cancellation
- View current approval status on your dashboard cards.
- Click **View Details** on any request to view the step-by-step audit history timeline.
- You can cancel a request at any time before Warden approval by clicking **Cancel**.

---

## 2. HOD (Head of Department) Guide

### Reviewing Outings
1. Sign in with HOD credentials (`hod@example.com`).
2. Your dashboard lists all student outing requests needing academic approval (`PENDING_HOD`).
3. Click **View** to inspect student details, destination, and stated reason.
4. Click **Approve** to pass the request to the Warden (`PENDING_WARDEN`).
5. Click **Reject** if the request is invalid. (Rejection terminates the workflow).

---

## 3. Warden Guide

### Mandatory Parent Approval Verification & Final Approval
1. Sign in with Warden credentials (`warden@example.com`).
2. Your dashboard displays all HOD-approved requests pending Warden action (`PENDING_WARDEN`).
3. Click **Process Request** for a student outing.
4. **Mandatory Step**: Personally contact the student's parent/guardian via phone or in person to verify consent.
5. Check the mandatory box: `[ ] Parent approval obtained`.
6. Click **Final Approve Outing**. The request moves to `APPROVED` and becomes visible at the main gate.

---

## 4. Main Gate Security (Watchman) Guide

### Gate Movement & Verification
1. Sign in with Watchman credentials (`watchman@example.com`).
2. Search for arriving students using their **Student Register Number** (e.g. `21CS101`) or **Outing ID** (`#OUT-1`).
3. **Recording Exit**: When the student leaves, click **Record Exit**. The system verifies `APPROVED` status before logging exit time.
4. **Recording Return**: When the student returns, click **Record Return**. The system logs return time, checks expected return time, and marks the outing `COMPLETED` (or `LATE_RETURN` if past scheduled return time).
