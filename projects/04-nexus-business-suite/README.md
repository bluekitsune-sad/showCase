# Nexus Business Suite

**Category:** 2 — I need a business application
**Built for:** Medium-sized companies whose operations live in spreadsheets and chat
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/04-nexus-business-suite`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · RBAC

## The problem

A growing company runs sales from one spreadsheet, HR from another, and project status from a group chat. Nobody can answer "who owns this lead", "who is on leave next week", or "what changed last Tuesday". They need one place with real permissions and an audit trail.

## What it does

- Sign in as different roles and see a different product: staff see their tasks, managers see their department, executives see the company.
- Move a lead through the pipeline and watch the activity land on the customer timeline and the audit log.
- Open the executive dashboard and read revenue pipeline, headcount, attendance and overdue work at a glance.

## Scope

**In scope for v1**

- Auth with owner / admin / manager / staff roles, department scoping enforced server-side
- CRM: leads, customers, contacts, notes, pipeline board, activity timeline
- HR: employee directory, attendance check-in/out, leave requests and approvals, recruitment pipeline
- Work: projects, tasks, assignment, due dates, notifications feed
- Append-only activity log and audit trail viewer
- Executive dashboard and reports with CSV export

**Out of scope for v1**

- Payroll and payslips
- Email/calendar sync (mock notification transport only)
- File storage beyond small attachments
- SSO / OAuth providers

## Data model

`User`, `Department`, `Role`, `Permission`, `Employee`, `Attendance`, `LeaveRequest`, `JobOpening`, `Applicant`, `Lead`, `Customer`, `Contact`, `Note`, `Task`, `Project`, `Notification`, `ActivityLog`.

Seed: 3 departments, 18 users across roles, 40 leads across stages, 25 customers, 60 tasks, 30 days of attendance, 8 leave requests, 5 job openings.

## Definition of done

- Clean-clone setup documented and working
- Lint, typecheck and build pass
- Every API route enforces the permission matrix on the server
- Staff cannot read another department's data, even by guessing URLs
- Every mutation writes an activity log entry with actor and timestamp
- README documents the role matrix and the demo accounts

## Notes for the build

Design direction: calm enterprise — dense but breathable tables, a persistent left sidebar, clear status colour semantics, no gradients.

Tricky parts: one permission helper used everywhere (`can(user, action, resource)`), department scoping applied in the query layer not the UI, and audit entries written inside the same transaction as the mutation.
