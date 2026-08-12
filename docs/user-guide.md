# Hostel Outing Permission & Approval Management System
## User Guide

Welcome to the end-user manual for the **Hostel Outing Permission & Approval Management System**. This guide provides step-by-step instructions for Students, Heads of Department (HOD), Hostel Wardens, and Main Gate Watchmen.

---

## 1. Student Manual

### 1.1 Account Login & Registration
1. **Access Portal**: Open `http://localhost:5173` in your web browser.
2. **Login**: Enter your student email address (e.g., `student.a@hostelapp.local`) and password.
3. **Sign Up (New Students)**:
   - Click **Sign Up** on the login screen.
   - Select role **Student**.
   - Fill in Required Fields: Full Name, Email, Password, Confirm Password, Register Number (e.g. `CSE2027001`), Department (e.g. `Computer Science and Engineering`), Hostel Block (e.g. `A Block`), Academic Year, and Room Number.
   - Click **Create Account**.

### 1.2 Student Dashboard Overview
Upon logging in, your dashboard displays:
- **Student Profile Summary**: Name, Register Number, Department, Hostel Block, Room Number.
- **Active Outings Section**: Cards showing your current active outing requests.
- **Action Buttons**: **+ New Outing Request** and **View Personal History**.

### 1.3 Creating an Outing Request
1. Click **+ New Outing Request**.
2. Complete the required fields:
   - **Outing Date**: Select scheduled date (cannot be in the past).
   - **Leaving Time**: Scheduled departure time.
   - **Expected Return Time**: Scheduled return time (must be after leaving time).
   - **Destination**: Destination name/address.
   - **Reason**: Specific purpose of outing.
3. Click **Submit Outing Request**.
4. The request status is initialized to `PENDING_HOD`.

### 1.4 Viewing Request Status & Tracking Progress
Your request progresses through visual status badges:
- **`PENDING_HOD`**: Submitted; awaiting academic approval by your HOD.
- **`PENDING_WARDEN`**: HOD approved; awaiting parent confirmation and final approval by your Hostel Warden.
- **`APPROVED`**: Warden granted final approval; ready for gate exit.
- **`EXITED`**: You have exited the campus gate.
- **`COMPLETED`**: Returned to hostel on or before expected return time.
- **`LATE_RETURN`**: Returned to hostel after expected return time.
- **`REJECTED`**: Declined by HOD or Warden.
- **`CANCELLED`**: Cancelled by you.

### 1.5 Parent Approval Status
In `PENDING_WARDEN` status, your Warden will contact your parent/guardian to verify permission. You can track whether parent confirmation has been completed by checking the **Parent Approval Confirmed** flag on your request card or history timeline.

### 1.6 Cancelling Eligible Requests
You can cancel an outing request as long as its status is `PENDING_HOD` or `PENDING_WARDEN`:
1. Locate the request card on your dashboard.
2. Click **Cancel Request**.
3. Status updates to `CANCELLED`, releasing any active time window blocks.

### 1.7 Viewing Personal Outing History
1. Click **View History** on your dashboard.
2. Browse past outing requests and click **View Audit Timeline** to inspect the detailed history log (showing exact submission, approval, exit, and return timestamps).

---

## 2. HOD (Head of Department) Manual

### 2.1 Login & Department Scope Rule
- Log in with your HOD credentials (e.g., `hod.cse@hostelapp.local`).
- **Department Scope Rule**: You can **ONLY** view and process outing requests for students enrolled in your assigned department. Access to other departments is strictly forbidden by the system.

### 2.2 Department Pending Dashboard
1. The HOD Dashboard (`/hod`) displays all pending requests (`PENDING_HOD`) for your department.
2. Review student information: Name, Register Number, Year, Destination, Outing Date, Times, and Reason.

### 2.3 Approving & Rejecting Requests
- **To Approve**:
  1. Optionally enter an academic review note in the comment box.
  2. Click **Approve**.
  3. Status advances to `PENDING_WARDEN`, routing the request to the student's Hostel Warden.
- **To Reject**:
  1. Enter a rejection reason in the comment box.
  2. Click **Reject**.
  3. Status changes to `REJECTED`, terminating the workflow.

### 2.4 Department History & Audit Timeline
1. Navigate to **HOD History** (`/hod/history`).
2. View departmental statistics (Total Outings, Approved, Rejected, Late Returns).
3. Search by student name, register number, or outing ID `#OUT-X`.
4. Filter by status (`APPROVED`, `COMPLETED`, `LATE_RETURN`, etc.) or hostel block.
5. Click **View Audit Timeline** on any record to inspect exact timestamps and actor comments.

---

## 3. Warden Manual

### 3.1 Login & Hostel Block Scope Rule
- Log in with your Warden credentials (e.g., `warden.a@hostelapp.local`).
- **Hostel Block Scope Rule**: You can **ONLY** view and process outing requests for students residing in your assigned hostel block. Access to other hostel blocks is strictly forbidden by the system.

### 3.2 Warden Pending Dashboard
1. The Warden Dashboard (`/warden`) displays HOD-approved requests (`PENDING_WARDEN`) for your hostel block residents.
2. Review student details, room number, destination, and expected return time.

### 3.3 Mandatory Parent Approval Confirmation
The system enforces parent/guardian consent verification:
1. Contact the student's parent or legal guardian via phone or in-person.
2. Check the mandatory box: `[x] Parent / Guardian Approval Confirmed by Phone`.
3. Click **Confirm Parent Approval**.
4. The system logs a `PARENT_APPROVAL_CONFIRMED` audit event.

### 3.4 Granting Final Approval or Rejection
- **To Approve**:
  1. Ensure parent confirmation has been completed.
  2. Optionally enter a Warden comment.
  3. Click **Approve Outing**. Status changes to `APPROVED`.
- **To Reject**:
  1. Enter a reason for rejection (e.g., "Parent declined consent").
  2. Click **Reject Outing**. Status changes to `REJECTED`.

### 3.5 Hostel Block History & Late Return Tracking
1. Navigate to **Warden History** (`/warden/history`).
2. Review block-wide metrics including Late Return counts.
3. Filter by department or search for specific student records.
4. Click **View Audit Timeline** to inspect gate movement and return delay details.

---

## 4. Watchman Manual

### 4.1 Login & Main Gate Desk
- Log in with Watchman credentials (`watchman@hostelapp.local`).
- The Watchman Gate Desk (`/watchman`) provides campus-wide gate verification operations.

### 4.2 Searching Students & Verifying Approval
1. Use the **Search Bar** to lookup students by:
   - Student Register Number (e.g. `CSE2027001`).
   - Student Name (e.g. `Arjun`).
   - Outing Request ID (e.g. `#OUT-4`).
2. Verify that the student's current status is strictly **`APPROVED`** before allowing campus exit.

### 4.3 Recording Gate Exit
1. Locate the student's outing card under **Today's Active Outings**.
2. Confirm the student's identity and destination.
3. Click **Record Exit**.
4. The status updates to **`EXITED`**, and the gate exit timestamp is recorded.

### 4.4 Recording Gate Return
1. When the student arrives back at the gate, locate their record (`EXITED` status).
2. Click **Record Return**.
3. The system automatically records the return timestamp and evaluates return punctuality.

### 4.5 Understanding Completed vs. Late Return Statuses
- **`COMPLETED`**: The student returned on or before their expected return time.
- **`LATE_RETURN`**: The student returned after their expected return time. The system logs the delay minutes and displays a warning toast.

---

## 5. Late Return Detection Manual

The system automates late return compliance evaluation:

### 5.1 Business Logic & Formula
When the Watchman clicks **Record Return**:
- `expected_return_datetime` = `outing_date` + `expected_return_time`
- `actual_return_datetime` = `current_timestamp`

$$\text{is\_late} = \text{actual\_return\_datetime} > \text{expected\_return\_datetime}$$

$$\text{delay\_minutes} = \max\left(1, \left\lfloor \frac{\text{actual\_return\_datetime} - \text{expected\_return\_datetime}}{60} \right\rfloor\right)$$

### 5.2 Example Scenarios
- **Scenario A (On Time)**:
  - Expected Return: `5:00 PM`
  - Actual Return: `4:48 PM`
  - Result: Status = **`COMPLETED`**, Delay = `0 minutes`.

- **Scenario B (Late Return)**:
  - Expected Return: `5:00 PM`
  - Actual Return: `5:35 PM`
  - Result: Status = **`LATE_RETURN`**, Delay = `35 minutes`.
  - Audit Trail: Appends `LATE_RETURN_DETECTED` action with `"Expected Return: 05:00 PM | Actual Return: 05:35 PM | Delay: 35 minutes"`.

> [!IMPORTANT]
> **Campus Entry Rule**: A student returning late is **NEVER blocked** from entering campus. The Watchman records the return, campus entry is granted immediately, and the system logs the late return for HOD, Warden, and Student administrative visibility.
