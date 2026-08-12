# System Design

This document details the visual UI design, user experience patterns, component hierarchy, page layouts, and operational mechanisms implemented across the **Hostel Outing Permission & Approval Management System**.

---

## 1. Design Goals

1. **Role-Driven Clarity**: Tailor every screen to the logged-in user's exact responsibilities (`STUDENT`, `HOD`, `WARDEN`, `WATCHMAN`).
2. **Zero Training Requirement**: Provide intuitive cards, distinct call-to-action buttons, clear labels, and visual status indicators.
3. **Safety & Audit Transparency**: Emphasize mandatory steps (such as Warden parent confirmation) and present full audit timelines.
4. **Responsive Performance**: Ensure layout responsiveness across desktop monitors, tablets, and mobile screen viewports.

---

## 2. User Experience

The user experience follows modern web design standards:
- **Color Palette**: Dark Slate background (`slate-900`/`slate-800`), crisp card surface containers, and vibrant role-based color accents (Indigo for Students, Purple for HODs, Emerald for Wardens, Amber/Teal for Watchmen).
- **Feedback & Alerts**: Toast notifications and inline dismissible banners communicate action results (success, warning, error) instantly.
- **Interactive Elements**: Micro-animations, smooth hover states, responsive cards, and clean modal dialog overlays.

---

## 3. Role-Based Dashboards

The application provides dedicated dashboards mapped to each authenticated role:
- **Student Dashboard** (`/student`): Focused on outing creation, active request cards, status progress, and personal history inspection.
- **HOD Dashboard** (`/hod`): Focused on academic review of pending department requests with approval/rejection comments.
- **Warden Dashboard** (`/warden`): Focused on block-scoped requests, mandatory parent approval verification, and final clearance.
- **Watchman Gate Desk** (`/watchman`): High-efficiency desk for student search, directory browsing, gate exit logging, and gate return recording.

---

## 4. Navigation Structure

Navigation is managed via `Navbar.tsx` and React Router DOM:
- **Global Header**: Displays the system title, current user name, role badge, department/block tags, and a **Logout** button.
- **Tab Navigation**: HODs and Wardens have quick toggle buttons between **Active Pending** requests and **Role History** view pages (`/hod/history` and `/warden/history`).

---

## 5. Authentication UI

**Page Component**: `frontend/src/pages/LoginPage.tsx`

- **Visual Layout**: Centered card overlay on a dark gradient background with a prominent lock icon and system title.
- **Features**:
  - Email & Password input fields.
  - Role switcher helper buttons for quick demo login credentials filling.
  - Demo Credentials Reference Table displaying sample logins for Student, HOD, Warden, and Watchman roles.
  - Quick link to the **Sign Up** page.

---

## 6. Signup UI

**Page Component**: `frontend/src/pages/SignupPage.tsx`

- **Visual Layout**: Structured multi-column registration form with dynamic field switching based on selected role.
- **Supported Roles for Registration**: `STUDENT`, `HOD`, `WARDEN`.
- **Dynamic Field Dependencies**:
  - Selecting `STUDENT`: Requires Full Name, Email, Password, Confirm Password, Register Number, Department, Hostel Block, Academic Year, and Room Number.
  - Selecting `HOD`: Requires Department assignment (Hostel Block & Register Number hidden).
  - Selecting `WARDEN`: Requires Hostel Block assignment (Department & Register Number hidden).
- **Validation**: Enforces password matching, valid email formatting, and required field completion.

---

## 7. Student Dashboard

**Page Component**: `frontend/src/pages/StudentDashboard.tsx`

- **Header Section**: Displays student profile overview (Name, Register Number, Department, Hostel Block, Room Number).
- **Outing Request Action Card**: Prominent **+ New Outing Request** button opening the creation form:
  - Date Picker (`outing_date`): Minimum date set to today.
  - Time Pickers (`leaving_time` & `expected_return_time`).
  - Destination input & Reason textarea.
- **Active Outings Section**: Grid of active outing cards displaying current status badges (`PENDING_HOD`, `PENDING_WARDEN`, `APPROVED`, `EXITED`).
- **Cancellation Action**: Eligible pending requests (`PENDING_HOD` or `PENDING_WARDEN`) feature a **Cancel Request** button.
- **Personal History Button**: Opens a modal displaying historical outings and full audit timelines.

---

## 8. HOD Dashboard

**Page Component**: `frontend/src/pages/HodDashboard.tsx`

- **Header Section**: Shows HOD profile, assigned department badge (`CSE` or `ECE`), and total pending request counter.
- **Pending Outings List**: Displays pending requests (`PENDING_HOD`) submitted by department students:
  - Student card details: Name, Register Number, Academic Year, Hostel Block, Destination, Reason, Date, Leaving & Return times.
  - Optional HOD Comment input field.
  - **Approve Button**: Advances request to `PENDING_WARDEN`.
  - **Reject Button**: Terminates request with `REJECTED`.

---

## 9. HOD History

**Page Component**: `frontend/src/pages/HodHistory.tsx`

- **Analytical Summary Cards**: Total Department Outings, Approved Count, Rejected Count, Late Returns Count.
- **Controls & Filters**:
  - Search Bar: Filters by student name, register number, or outing ID `#OUT-X`.
  - Status Filter Dropdown (`PENDING_HOD`, `PENDING_WARDEN`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXITED`, `COMPLETED`, `LATE_RETURN`).
  - Hostel Block Filter Dropdown.
- **Outings Data Table / Cards**: Lists complete department history with audit timeline inspect buttons.

---

## 10. Warden Dashboard

**Page Component**: `frontend/src/pages/WardenDashboard.tsx`

- **Header Section**: Shows Warden profile, assigned hostel block badge (`A Block`, `B Block`, or `C Block`), and pending count.
- **Pending Requests List**: Displays HOD-approved requests (`PENDING_WARDEN`) for block residents.
- **Mandatory Parent Confirmation UI**:
  - Interactive Checkbox: `[ ] Parent / Guardian Approval Confirmed by Phone`.
  - **Parent Contact Button**: Quick trigger to mark parent confirmation status (`POST /api/warden/outings/{id}/parent-confirmation`).
- **Action Buttons**:
  - **Approve Outing**: Enabled only after parent confirmation checkbox is checked. Advances status to `APPROVED`.
  - **Reject Outing**: Rejects request with optional reason.

---

## 11. Warden History

**Page Component**: `frontend/src/pages/WardenHistory.tsx`

- **Analytical Summary Cards**: Total Block Outings, Approved Count, Exited Count, Completed Count, Late Returns Count.
- **Controls & Filters**: Search bar (name/ID), Status filter, Department filter.
- **Outings Data Table**: Displays historical block records, parent confirmation timestamps, and late return delay indicators.

---

## 12. Watchman Dashboard

**Page Component**: `frontend/src/pages/WatchmanDashboard.tsx`

- **Operational Layout**: High-efficiency dual-section layout for main gate security officers.
- **Today's Active Outings Section**: Displays students currently authorized to exit or return:
  - Displays student avatar icon, Name, Register Number, Department, Hostel Block, Outing ID.
  - **Record Exit Button**: Enabled when status is `APPROVED`. Updates status to `EXITED`.
  - **Record Return Button**: Enabled when status is `EXITED`. Updates status to `COMPLETED` or `LATE_RETURN`.

---

## 13. Student Directory

**Integrated Component**: `WatchmanDashboard.tsx` (Directory Tab)

- **Purpose**: Campus-wide student lookup desk for Watchman security verification.
- **Features**:
  - Live Search Bar: Real-time search across student register numbers, names, and emails.
  - Department & Hostel Block Filter Dropdowns.
  - Student Directory Grid: Displays student cards with year, room number, current active outing status, and quick action buttons.

---

## 14. Outing Details Modal

**Component**: `frontend/src/components/OutingDetailModal.tsx`

- **Overlay Window**: Displays complete outing metadata:
  - Student Information: Name, Register Number, Department, Hostel Block, Room Number.
  - Outing Information: Date, Leaving Time, Expected Return Time, Destination, Reason.
  - Current Status & Parent Approval Status.
  - **Audit Timeline Component**: Full audit log visualization.

---

## 15. Audit Timeline

**Component**: `frontend/src/components/Timeline.tsx`

- **Visual Design**: Vertical chronological timeline with connected icon nodes.
- **Timeline Nodes**:
  - `SUBMITTED`: Blue icon node.
  - `HOD_APPROVED` / `WARDEN_APPROVED`: Green checkmark nodes.
  - `PARENT_APPROVAL_CONFIRMED`: Purple phone checkmark node.
  - `EXIT_RECORDED`: Amber gate node.
  - `RETURN_RECORDED` / `COMPLETED`: Emerald arrival node.
  - `LATE_RETURN_DETECTED`: Orange warning node with delay minutes badge.
  - `REJECTED` / `CANCELLED`: Red cross nodes.
- **Node Content**: Action title, actor name, actor role badge, comment string, formatted timestamp.

---

## 16. Status Badges

**Component**: `frontend/src/components/StatusBadge.tsx`

The system uses standard status pill badges:

| Status Key | Badge Color Styling | Visual Label |
| :--- | :--- | :--- |
| `PENDING_HOD` | `bg-amber-500/10 text-amber-400 border-amber-500/20` | Pending HOD |
| `PENDING_WARDEN` | `bg-purple-500/10 text-purple-400 border-purple-500/20` | Pending Warden |
| `PENDING_WARDEN_ASSIGNMENT` | `bg-purple-500/10 text-purple-400 border-purple-500/20` | Pending Warden Assignment |
| `APPROVED` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` | Approved |
| `REJECTED` | `bg-rose-500/10 text-rose-400 border-rose-500/20` | Rejected |
| `CANCELLED` | `bg-slate-500/10 text-slate-400 border-slate-500/20` | Cancelled |
| `EXITED` | `bg-blue-500/10 text-blue-400 border-blue-500/20` | Exited (Off Campus) |
| `COMPLETED` | `bg-green-500/10 text-green-400 border-green-500/20` | Completed |
| `LATE_RETURN` | `bg-orange-500/10 text-orange-400 border-orange-500/20` | Late Return |

---

## 17. Parent Approval Confirmation

- **UX Design**: Prominent checkbox and action button in `WardenDashboard.tsx`.
- **Enforcement**: Final **Approve Outing** button remains disabled or returns backend `HTTP 400` until parent consent is explicitly confirmed.
- **Audit Logging**: Appends a `PARENT_APPROVAL_CONFIRMED` event to the audit timeline.

---

## 18. Gate Exit / Return UI

- **Watchman Interface**:
  - **Exit Action**: Highlighted blue **Record Exit** button for `APPROVED` outings.
  - **Return Action**: Highlighted emerald **Record Return** button for `EXITED` outings.
- **Confirmation Feedback**: Toast alert notifies the Watchman upon successful recording. If return is late, a warning alert displays the delay minutes.

---

## 19. Late-Return Presentation

- **Badge Styling**: High-contrast orange badge (`LATE_RETURN`).
- **Delay Display**: Renders explicit delay duration in minutes (e.g. `Late Return (Delay: 35 mins)`).
- **Timeline Detail**: Displays `Expected Return`, `Actual Return`, and computed delay minutes.

---

## 20. Responsive Design

- Built with Tailwind CSS responsive grid utilities (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- Navigation bar collapses cleanly into standard mobile layouts.
- Tables feature horizontal scroll containers (`overflow-x-auto`) to prevent layout breaking on mobile devices.

---

## 21. Error Handling

- **API Interceptor**: Captures `HTTP 401 Unauthorized` responses and redirects to `/login`.
- **Inline Alert Banners**: Displays specific backend error messages (e.g., "Overlapping outing request exists", "Leaving time must be before expected return time") directly above form inputs.

---

## 22. Validation

- **Frontend Validation**: React form state checks required fields, non-matching passwords, and past dates before dispatching requests.
- **Backend Validation**: Pydantic models validate request payloads; `OutingService` enforces business constraints.

---

## 23. Security Considerations

- Passwords hashed using Bcrypt with salt rounds.
- Tokens stored securely in browser `localStorage` and sent via standard HTTP Authorization headers.
- Backend strictly enforces department and block authorization boundaries on all data endpoints.

---

## 24. Accessibility Considerations

- High contrast text-to-background ratios conforming to WCAG standards.
- Semantic HTML tags (`<nav>`, `<header>`, `<main>`, `<section>`, `<article>`, `<button>`).
- Focus states and keyboard-navigable form inputs and buttons.
