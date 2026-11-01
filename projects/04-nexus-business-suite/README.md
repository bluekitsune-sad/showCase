# Nexus Business Suite

**Category:** 2 — I need a business application
**Built for:** Medium-sized companies whose operations live in spreadsheets and chat
**Label:** For businesses & enterprises
**Status:** In progress
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

## Run it locally

```bash
cd projects/04-nexus-business-suite
npm install
cp .env.example .env        # optional; defaults work for the demo
npm run db:setup            # generate client, create SQLite db, seed
npm run dev                 # http://localhost:3000
```

`npm run db:reset` recreates the database from the seed whenever you want a clean slate.

## Demo accounts

Every seeded account uses the password `demo1234`. The sign-in page lists one account per role; the full cast is below. All names, emails and companies are synthetic.

| Role | Name | Email | Department |
| --- | --- | --- | --- |
| Owner | Avery Nakamura | avery@nexus.demo | Company-wide |
| Admin | Jordan Ellis | jordan@nexus.demo | Operations |
| Admin | Priya Raman | priya@nexus.demo | Sales |
| Manager | Marcus Webb | marcus@nexus.demo | Sales |
| Manager | Elena Voss | elena@nexus.demo | Operations |
| Manager | Samir Haddad | samir@nexus.demo | People |
| Manager | Nora Kessler | nora@nexus.demo | Sales |
| Staff | Diego Alvarez | diego@nexus.demo | Sales |
| Staff | Hana Suzuki | hana@nexus.demo | Sales |
| Staff | Oliver Brandt | oliver@nexus.demo | Sales |
| Staff | Ivy Okonkwo | ivy@nexus.demo | Sales |
| Staff | Leo Petrov | leo@nexus.demo | Operations |
| Staff | Mia Castellanos | mia@nexus.demo | Operations |
| Staff | Noah Fitzgerald | noah@nexus.demo | Operations |
| Staff | Zara Ahmed | zara@nexus.demo | Operations |
| Staff | Felix Moreau | felix@nexus.demo | People |
| Staff | Amara Diallo | amara@nexus.demo | People |
| Staff | Theo Lindqvist | theo@nexus.demo | Company-wide |

## Role matrix

Permissions are defined once in `src/lib/permissions.ts` and checked on the server with `can(actor, action)`. Department scoping is a separate concern, applied in the query layer via `departmentFilter()` / `ownerDepartmentFilter()` so a role can be allowed an action but still limited to its own department.

| Scope | Roles | Sees |
| --- | --- | --- |
| Company-wide | Owner, Admin | Every department's records |
| Department | Manager, Staff | Only their own department's records |
| Own records | Staff (personal actions) | Their own attendance, leave and tasks |

| Action | Owner | Admin | Manager | Staff |
| --- | :-: | :-: | :-: | :-: |
| View dashboard | ✓ | ✓ | ✓ | ✓ |
| Read leads / customers | ✓ | ✓ | ✓ | ✓ |
| Create / update leads and customers | ✓ | ✓ | ✓ | — |
| Change lead stage | ✓ | ✓ | ✓ | — |
| Delete leads / customers | ✓ | ✓ | — | — |
| Read employee directory | ✓ | ✓ | ✓ | ✓ |
| Create employees | ✓ | ✓ | — | — |
| Update employees | ✓ | ✓ | own dept | — |
| Check in / out | ✓ | ✓ | ✓ | ✓ |
| Read attendance | ✓ | ✓ | own dept | own record |
| Request leave | ✓ | ✓ | ✓ | ✓ |
| Approve / reject leave | ✓ | ✓ | own dept | — |
| Read recruitment | ✓ | ✓ | ✓ | — |
| Manage job openings / applicants | ✓ | ✓ | own dept | — |
| Read / create / update tasks | ✓ | ✓ | ✓ | ✓ |
| Assign tasks | ✓ | ✓ | ✓ | — |
| Manage projects | ✓ | ✓ | ✓ | — |
| View activity log (audit) | ✓ | ✓ | — | — |
| Manage users | ✓ | ✓ | — | — |
| View reports | ✓ | ✓ | own dept | — |

Sign-in uses a signed, http-only session cookie. The demo password scheme is saltless SHA-256 — fine for a local SQLite demo with a shared throwaway password, not for anything real; a production build would swap in argon2 or scrypt without touching the auth flow.
