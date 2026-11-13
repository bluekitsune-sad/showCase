# REVIEW

The review gate. Nothing is finished until it has been checked by someone who did not write it.

**How it works**

1. The builder finishes a `TODO.md` item, ticks it, and appends **one entry** at the bottom of the queue below with `Review: needed`.
2. The reviewer takes the **oldest** `Review: needed` entry, reads the diff, runs the checks itself, and writes a verdict.
3. Approved → the TODO line is marked `reviewed <date>`. Rejected → the TODO line goes back to `- [ ]` with `changes requested`, follow-up items are added, and the builder fixes them on a later run.
4. After two rejections the item moves to **Blocked** and the owner is asked.

**Entry format** (append under `## Queue`, newest at the bottom):

```markdown
### P04-1 · round 1 — Scaffold Nexus Business Suite

- **Built:** 31 Oct 2026, 09:41 UTC
- **Commit:** `a1b2c3d` — P04-1: scaffold Nexus Business Suite
- **Scope:** App shell, design tokens, Prisma schema, seed data
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npx prisma validate`
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —
```

The reviewer flips `**Review:**` to `approved` or `changes requested`, fills the last two lines, and adds numbered findings with file references when rejecting. Entries are never deleted — they are the audit trail of what was accepted and why.

---

## Queue

### P04-1 · round 1 — Scaffold Nexus Business Suite

- **Built:** 31 Oct 2026, 04:26 UTC
- **Commit:** `3130235` — P04-1: scaffold Nexus Business Suite
- **Scope:** Next.js 16 + TS strict + Tailwind 4 + Prisma 7/SQLite scaffold, design tokens, app shell (sidebar/topbar/theme), full Prisma schema, deterministic seed (18 users, 40 leads, 25 customers, 60 tasks, 30 days attendance, leave, recruitment, activity log), dashboard reading real seeded counts with loading/error states
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npx prisma db push`, `npx tsx prisma/seed.ts`, production-server smoke test (`/dashboard` 200 with all sections; `/` redirects)
- **Review:** approved

- **Reviewed:** 9 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in the project folder — all pass (typecheck requires the generated Prisma client, so it fails as expected before `db:setup`). Inspected the schema and seed: all 16 models present, deterministic `mulberry32` seed with synthetic `@nexus.demo` data, money stored as integer minor units, no `.env` or secrets committed. App shell, design tokens, sidebar/topbar/theme toggle, and dashboard loading/error states are all present; dashboard reads real seeded counts, including today's attendance. No files touched outside the project (README status line and `log/state.md` only), no `.github` changes. README has no agent/automation references. Approved.

### P04-2 · round 1 — Auth and department-scoped RBAC

- **Built:** 31 Oct 2026, 19:43 UTC
- **Commit:** `ae7ba8e` — P04-2: add authentication and department-scoped RBAC
- **Scope:** Signed http-only session cookie, login page with demo-account picker, logout, requireUser() gate, permission matrix (can/assertCan/departmentFilter) used server-side on the dashboard, real user in the topbar, README run-it-locally + demo accounts + role matrix
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:setup`; production-server smoke test — `/` and `/dashboard` redirect to `/login` unauthenticated, valid session renders dashboard, tampered cookie rejected, owner (company-wide) sees 18 headcount / $631,900 pipeline vs Sales staff (7 / $597,100), staff activity log gated
- **Review:** approved

- **Reviewed:** 9 Nov 2026
- **Verdict notes:** Re-ran `npm run lint`, `npm run typecheck`, `npm run build` on the project — all pass. Read `session.ts`, `password.ts`, `permissions.ts`, the login/logout server actions and the app layout: the HMAC-signed http-only cookie is verified with `timingSafeEqual`, expiry is enforced, and `requireUser()` gates the whole `(app)` route group server-side. Permission checks run in the query layer (`departmentFilter`/`ownerDepartmentFilter`), not just the UI; the activity feed is read-only for owner/admin. Runtime smoke test with `npm run start` on :3500: unauthenticated `/dashboard` → 307 to `/login`; a tampered cookie → 307; a signed owner session (id 1) rendered 18 headcount, $631,900 pipeline and 20 customers; a Sales staff session (Diego, id 8) rendered 7 headcount, $597,100 pipeline and 6 customers with the department-scoped label and no activity feed. Demo password scheme and the `AUTH_SECRET` fallback are explicitly documented as local-demo-only. No secrets, no `.github` changes, no work outside the project. Approved.

### P04-3 · round 1 — Build the CRM surface

- **Built:** 9 Nov 2026, 14:18 UTC
- **Commit:** `b957459` — P04-3: build the CRM surface
- **Scope:** Leads list with search, stage/source filters and pipeline totals; lead pipeline board by stage with audited stage moves; customers list with search and status filters; customer detail with contacts, notes and activity timeline; server-side permission and department checks on every mutation
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:setup`; production-server smoke test — `/leads`, `/pipeline`, `/customers`, `/customers/1` return 200 for the owner; unauthenticated `/leads` returns 307 to login; operations staff gets the not-found view for a sales-owned customer; stage move persisted with a `lead.stage_changed` activity entry; note creation persisted with a `note.added` activity entry; a staff stage-change POST left the lead unchanged
- **Review:** approved

- **Reviewed:** 10 Nov 2026
- **Verdict notes:** Re-ran `npm install`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in the project — all pass (Next.js 16.4.3, all CRM routes built). Read `leads/actions.ts`, `customers/actions.ts`, both list pages, the pipeline board, the customer detail page, `permissions.ts` and `session.ts`. Department scoping runs in the query layer (`ownerDepartmentFilter` for leads/pipeline, a sourceLead→owner department filter for customers); each mutation calls `requireUser`, `can`, then `canAccessDepartment`, and writes its `ActivityLog` row in the same `$transaction`. Cross-department customer detail returns `notFound()`. Empty, loading and error states are present. Runtime smoke on `npm run start` (:3510): unauthenticated `/leads` → 307 to `/login`; owner session → 200 on `/leads`, `/pipeline`, `/customers`, `/customers/1`; Sales staff session → 200 on the CRM pages rendering "Own department" scoping. Money stays in integer minor units, no secrets or real data, no `.github` changes, nothing touched outside the project. README has no agent/automation references. Approved; no findings.

### P04-4 · round 1 — Build the HR surface

- **Built:** 11 Nov 2026, 23:28 UTC
- **Commit:** `bd3f861` — P04-4: add HR surfaces
- **Scope:** Employee directory with search and department filter; attendance log with date view and self check-in/out; leave requests with submit form and approve/reject decisions; recruitment pipeline columns by applicant stage; department scoping and activity log entries on every mutation; People nav enabled
- **Checked by builder:** `npm run typecheck`, `npm run lint`, `npm run build`
- **Review:** approved

- **Reviewed:** 12 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass; the build emits `/employees`, `/attendance`, `/leave` and `/recruitment` as dynamic routes. Read both action files, all four pages, `badges.tsx`, the `domain.ts`/`nav.ts` diffs, `permissions.ts` and the Prisma models. Auth and role checks run server-side on every page and mutation: `requireUser` gates each route, `can()` gates read/mutate, `departmentFilter` scopes the employee and recruitment queries, attendance uses owner/admin = all, manager = own department, staff = own record, and leave adds `canAccessDepartment` to the approve/reject action on top of the role check. Check-in/out is per-employee against the `@@unique([employeeId, date])` row and both mutations write their `ActivityLog` entries in the same transaction; leave request and decision do the same. Every page has an empty state, the shared `(app)/loading.tsx` and `(app)/error.tsx` cover loading/error, and forms have real labels and table headers. Runtime smoke on `npm run start` (:3520): unauthenticated `/leave` → 307 to `/login`; owner session → 200 on all four HR routes; Sales staff (id 8) `/leave` rendered only their own record with the "Own records" scope label and no other employee names; People staff (id 16) likewise saw only their own leave; staff `/recruitment` rendered the access-denied view. No secrets, no real data, no `.github` changes, nothing touched outside the project. README voice is clean. Approved, no blocking findings. Two non-blocking notes for later polish: the input regex accepts impossible calendar dates (e.g. `2026-02-31` rolls over rather than being rejected), and the sidebar shows the Recruitment link to staff who then hit the access-denied page.

### P04-5 · round 1 — Build tasks and projects

- **Built:** 12 Nov 2026, 13:39 UTC
- **Commit:** `39f8234` — P04-5: add projects, task board and notifications
- **Scope:** Project list with search/status filters, task progress and audited create/status changes; task board by status with assignee, due date and overdue markers; task create/update writing activity log entries and assignment notifications; personal notifications feed with unread state and mark-all-read; server-side task scoping (staff own, managers department); Work nav enabled
- **Checked by builder:** `npm run typecheck`, `npm run lint`, `npm run build`, `npx prisma validate`; `npm run db:setup` then production-server smoke test — `/dashboard`, `/tasks`, `/projects`, `/notifications`, `/pipeline` all return 200 for an owner session
- **Review:** approved

- **Reviewed:** 13 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass; the build emits `/tasks`, `/projects` and `/notifications` as dynamic routes. Read both action files, `notifications/actions.ts`, `lib/work.ts`, `permissions.ts`, and the three pages plus the `domain.ts`/`nav.ts` diff. Auth and RBAC run server-side: `requireUser` gates each route, `can()` gates read/create/update/assign/manage, and task visibility is applied in the query layer via `taskScope` (owner/admin all, manager by assignee department, staff by own assignee). `updateTask` re-checks row access with `canTouchTask` and refuses assignment changes from roles without `task.assign`; `createTask` forces the actor as assignee for scoped roles and validates the assignee's department. Notifications are always filtered by `userId`, including the mark-read update. Every mutation writes its `ActivityLog` row in the same transaction as the change, and assignment/done notifications are created there too. All three pages have empty states and the shared `(app)/loading.tsx` and `(app)/error.tsx` cover loading/error; forms use real labels. Runtime smoke on `npm run start` (:3520) with signed cookies: staff Diego (id 8) `/tasks` returned 200 with only his four tasks and none of the other Sales tasks; manager Marcus (id 4) saw department-1 tasks but not a department-2 task. No secrets, no real data, no `.github` changes, nothing touched outside the project. README voice is clean. Approved, no blocking findings. Non-blocking note: date inputs still accept impossible calendar days (`2026-02-31`), the same accepted nit from P04-4.

### P04-6a · round 1 — Dashboard attendance rate and trend charts

- **Built:** 12 Nov 2026, 22:40 UTC
- **Commit:** `6eb5880` — P04-6a: add dashboard attendance rate and trend charts
- **Scope:** Attendance rate KPI from the latest recorded day with present/total hint; pipeline-created six-month and 14-day attendance-rate bar charts built from department-scoped data; shared accessible TrendBars component with empty states and a compact money formatter
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser runtime smoke was run in this environment
- **Review:** approved

- **Reviewed:** 13 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass. Read the dashboard diff, `trend-bars.tsx` and the new `formatMoneyCompact` helper. Attendance rate and both trend series are built from department-scoped queries (`departmentFilter` / `ownerDepartmentFilter`), so owner/admin see the company, managers and staff their department; leads exclude `lost` and are bucketed by UTC creation month, attendance by UTC day over the last 14 days, and the KPI uses the latest recorded day in that window. Values are integer minor units formatted at render (`/ 100` only in the formatter), and the component shows an empty message when there are no points or the maximum is zero, with `role="img"`, an aria label and a screen-reader list. Runtime smoke on `npm run start` (:3520): owner and staff dashboards both returned 200 with the attendance KPI and both charts rendered. No secrets, no real data, no `.github` changes, nothing touched outside the project. README voice is clean. Approved, no blocking findings. Non-blocking notes: the attendance denominator counts holiday and leave rows as non-present, which may understate the rate; and the staff dashboard shows a department-level attendance aggregate rather than only their own record, consistent with the aggregate count the dashboard already showed before this item.

### P04-6b · round 1 — Reports page and CSV export

- **Built:** 13 Nov 2026, 12:58 UTC
- **Commit:** `e387a75` — P04-6b: add reports page and CSV export
- **Scope:** `/reports` gated by server-side `report.view`, department-scoped pipeline/headcount/attendance/task reports with UTC date-range filters and empty states; `/reports/export` re-checks permission and streams the matching CSV; Reports entry added under Overview
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:setup` — all pass; runtime query smoke returned owner totals (6 leads, 18 headcount, 396 attendance days, 24 tasks) and different manager totals, confirming scoping; no browser session smoke
- **Review:** approved

- **Reviewed:** 13 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass. Read `lib/reports.ts`, the reports page, the export route and the nav diff. The page calls `requireUser` and checks `report.view` server-side; the export route re-checks the session and permission and returns 401/403 itself, rejecting unknown report types with 400. Every series applies department scoping in the query layer (`ownerDepartmentFilter` for leads, `departmentFilter` for employees/attendance and task assignees), so owner/admin see the company and managers their department; staff have no `report.view` and get the access-denied view. Ranges parse to UTC day bounds with an inclusive end (`endExclusive = to + 1 day`), bad ranges fall back with a visible message, and money stays in integer minor units until rendered or exported. Non-empty tables, empty states, accessible table captions and labelled export links are present. Runtime smoke on `npm run start` (:3520) with signed cookies: owner and manager `/reports` returned 200, staff `/reports` rendered the access-denied message; CSV export returned `text/csv` for owner and manager, 403 for staff, 401 unauthenticated and 400 for an unknown type. Owner pipeline CSV totaled 6 leads / 142,200.00 and the manager's 5 leads / 110,200.00, confirming scoping. No secrets, no real data, no `.github` changes, nothing touched outside the project. README voice is clean. Approved, no blocking findings. Non-blocking notes: the Reports nav link is shown to staff who then hit the access-denied view (same pattern as Recruitment), and the date parser still normalises impossible calendar days such as `2026-02-31` instead of rejecting them.
