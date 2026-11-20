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

### P04-6c · round 1 — Audit trail viewer

- **Built:** 14 Nov 2026, 12:02 UTC
- **Commit:** `8d20ac7` — P04-6c: add audit trail viewer
- **Scope:** `/activity` gated by server-side `activity.read`; append-only ActivityLog table newest first with actor, action, entity and summary; summary/entity/action/actor/date-range filters, 25-row pagination and empty/access-denied states; Activity log nav item enabled
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; seeded Prisma query returned 80 activity rows, 7 distinct actions, 18 actors and a 25-row first page; no browser session smoke
- **Review:** approved

- **Reviewed:** 14 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass. Read the `/activity` page, `lib/nav.ts` and `lib/permissions.ts`; the page calls `requireUser` and refuses with an access-denied view unless `can(actor, "activity.read")`, which is owner/admin only, so no department scoping is needed at this tier. Queries read `ActivityLog` newest first with the actor relation, apply entity/action/actor/summary/UTC date-range filters in the query layer, clamp the requested page into range, and preserve filters across Previous/Next links. The empty state distinguishes "nothing logged" from "no matches", plus a bad-date message and a labelled, captioned table with `scope="col"` headers. The nav item is now enabled, matching the shipped route. Runtime smoke on `npm run start` (:3521) with signed cookies: owner `/activity` returned 200 and "Showing 1–25 of 80 entries", staff returned the access-denied message, unauthenticated returned 307 to `/login`, and an unmatched filter action rendered the empty state. No secrets, no real data, no `.github` changes, nothing touched outside the project. README voice is clean. Approved, no blocking findings. Non-blocking note: `parseDate` still normalises impossible calendar days such as `2026-02-31` to early March instead of rejecting them, the same behaviour already noted on P04-6b.

### P04-6d · round 1 — Responsive and accessibility pass, README case study

- **Built:** 15 Nov 2026, 12:34 UTC
- **Commit:** `a8cbb05` — P04-6d: responsive and accessibility pass
- **Scope:** Skip link and focusable main region; mobile drawer close button, Escape handling, `aria-expanded` on the menu trigger and off-canvas nav removed from the tab order while closed; screen-reader captions on every data table; Nexus README architecture, accessibility and scope notes, Shipped status and root status row.
- **Checked by builder:** `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke, so layout was checked from the Tailwind classes rather than rendered at 360 px.
- **Review:** approved

- **Reviewed:** 2026-11-15
- **Verdict notes:** Re-ran `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass. Read the layout diff and the touched pages: the skip link targets a `tabIndex={-1}` main region, the drawer has a labelled close button plus Escape and overlay dismissal, link clicks call `onClose`, the closed drawer uses `invisible` so it leaves the tab order (overridden with `lg:visible` on desktop), the trigger exposes `aria-expanded`, and all eight tables in the app have an `sr-only` caption with scoped headers. Checked the README claims: seed really contains 3 departments, 18 users, 40 leads, 25 customers, 60 tasks and 30 days of attendance; route-level and dashboard `loading`/`error` files exist; dark-mode tokens and a `color-scheme` switch are present; root status row says Shipped with the last-updated line intact. No secrets, no real data, no `.github` changes, nothing touched outside the project, README voice is clean. Approved with one non-blocking accessibility note, recorded as `P04-6d-r1`: focus is not moved into the drawer when it opens and is not restored to the trigger when Escape closes it, so a keyboard user who opens the drawer lands in the obscured page content on the next Tab.

### P04-6d-r1 · round 1 — Mobile drawer focus management

- **Built:** 15 Nov 2026, 21:30 UTC
- **Commit:** `17566f8` — P04-6d-r1: trap and restore drawer focus
- **Scope:** Move focus into the drawer on open, trap Tab/Shift+Tab inside it, restore focus to the menu trigger on Escape/close, and mark the topbar/main region inert while the mobile drawer is open
- **Checked by builder:** `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke, so focus behaviour was checked by reading the effect and keydown logic rather than rendered
- **Review:** approved

- **Reviewed:** 2026-11-15
- **Verdict notes:** Re-ran `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/04-nexus-business-suite` — all pass, no warnings. Read `app-shell.tsx`, `sidebar.tsx` and the `topbar.tsx` diff. Confirmed: the wrapper around topbar/main gets the React 19 boolean `inert` while the drawer is open (and the drawer is a sibling, so it stays interactive); opening moves focus to the drawer's first control (the labelled close button) and `tabIndex={-1}` gives a fallback; the window keydown handler traps Tab/Shift+Tab with wrap and pulls focus back if it is outside the drawer; `wasOpen` avoids stealing focus on mount and restores it to the menu trigger on Escape, overlay click and link close. The trigger is `lg:hidden`, so the permanent desktop sidebar is unaffected when the drawer state is false. No browser session smoke was possible here (client-side focus is not observable from a server render); the effect and keydown logic were checked by reading. No secrets, no real data, no `.github` changes, nothing touched outside the project; README untouched. Approved, no findings.

### P01-1 · round 1 — Scaffold Maison Store

- **Built:** 17 Nov 2026, 14:19 UTC
- **Commit:** `7574b4a` — P01-1: scaffold Maison Store
- **Scope:** Next.js 16 + strict TypeScript + Tailwind 4 + Prisma 7/SQLite; editorial design tokens (stone paper, ink, one moss accent, serif display); storefront shell with announcement bar, masthead, collections mega-menu, mobile nav, footer and skip link; full commerce schema; deterministic seed (4 collections, 24 products, 99 variants, 6 customers, 8 orders, 2 discount codes); home, collections index/detail, empty bag, custom 404, loading and error states; project README setup, demo data, architecture and limits.
- **Checked by builder:** `npm install`, `npx prisma migrate dev --name init`, `npx tsx prisma/seed.ts`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. Production `next start` smoke: `/`, `/collections`, `/collections/atelier-noir`, `/cart` return 200 and render seeded collections/products; unknown collection slug renders the custom not-found page and title. Note: that unknown-slug response carries a 200 status rather than 404 because the dynamic shell has already streamed — the body and title are the not-found surface.
- **Review:** approved

- **Reviewed:** 2026-11-17
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup` (generate + `db push` + seed), `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; the build emits `/`, `/collections`, `/collections/[slug]`, `/cart` and `/_not-found` as dynamic routes. Seeded counts confirmed by a direct SQLite query: 4 collections, 24 products, 99 variants, 6 customers, 8 orders, 2 discount codes, with two gradient `ProductImage` rows per product. Read the schema, seed, `layout.tsx`, `site-header.tsx`, `site-chrome.tsx`, the collections pages, `product-card.tsx`, `format.ts`, `db.ts` and the error/loading/not-found surfaces: money stays in integer minor units, demo data is synthetic, `.env`, `dev.db` and the generated client are gitignored, no secrets or real personal data, no `.github` changes, nothing touched outside the project. Production smoke on `:3600`: `/`, `/collections`, `/collections/atelier-noir`, `/collections/linen-season` and `/cart` return 200 with seeded content. Approved, no blocking findings. Non-blocking note recorded as `P01-1-r1`: an unknown collection slug (e.g. `/collections/does-not-exist`) renders the custom not-found body but with HTTP 200 because the dynamic shell has streamed; the status code should become a real 404. Cosmetic doc fix made during review: the project README claimed the seed is fully deterministic, but order dates are relative to the day you seed, so that sentence now says the catalogue is deterministic and dates are relative.

### P01-2 · round 1 — Storefront home page

- **Built:** 17 Nov 2026, 23:52 UTC
- **Commit:** `240a790` — P01-2: build the storefront home page
- **Scope:** Hero with featured-collection link; large featured-collection section; collections strip; featured product grid; seeded journal/editorial section; seeded testimonials; newsletter block with server-side validation and a `NewsletterSubscriber` write; empty states for featured, journal, testimonials and product grid; responsive from 360 px with three new home-content models and seed rows.
- **Checked by builder:** `npm install`, `npx prisma migrate dev --name home_content`, `npm run db:seed`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. Production `next start` smoke: home page returns 200 and renders all six sections (`Featured collection`, `From the journal`, `Worn, mended, kept`, `New cloth, once a month`); the newsletter action was reviewed by reading only, not submitted from a browser.
- **Review:** approved

- **Reviewed:** 2026-11-17
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` on the work tip that contains this commit — all pass. Read the `page.tsx` diff, `newsletter/actions.ts`, `newsletter-form.tsx`, the schema and seed additions. The hero, featured collection, collections strip, featured product grid, journal and testimonials all read Prisma in one `Promise.all`; the featured collection falls back to the first seeded collection and the product grid, journal and testimonials each have an empty state. The newsletter form is a labelled, `aria-live` client form whose server action trims and lowercases the address, caps it at 254 characters, validates the format before any write, treats a duplicate as a friendly success, writes a `NewsletterSubscriber` row and returns a visible error on failure. Seed confirmed at 3 testimonials and 3 journal entries, and every seeded editorial `href` resolves (`/collections/atelier-noir`, `/collections/linen-season`, `/#story`). Production smoke on `:3600`: `/` returns 200 with all six section headings present in the rendered HTML. The newsletter write path was checked by reading, not submitted from a browser. No secrets, no real data, no `.github` changes, nothing touched outside the project; README voice is clean. Approved, no blocking findings. Non-blocking note: the "Read more" links on journal cards point at collection pages rather than article destinations, which is acceptable while there is no article surface.


### P01-3 · round 1 — Catalogue and product detail

- **Built:** 18 Nov 2026, 13:51 UTC
- **Commit:** `ab486ce` — P01-3: add catalogue filters and product detail
- **Scope:** URL-driven sort and filters (price band, size, colour, availability) on every collection page plus a new `/products` catalogue; product pages at `/products/[slug]` with gallery, colour and size picker showing live variant stock and SKU, size guide, material/collection details, related pieces; product cards now link through to their product page; README walkthrough and limits updated.
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. Production `next start` smoke on `:3100`: `/products`, `/products?size=M&sort=price-asc`, `/products/wool-overcoat` and `/collections/atelier-noir?colour=Ink&availability=in-stock` return 200 with rendered content. Known: an unknown product slug renders the not-found body with HTTP 200, the same streaming limitation as the collection route tracked in `P01-1-r1`.
- **Review:** approved

- **Reviewed:** 18 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; the build emits `/products` and `/products/[slug]` as dynamic routes. Read `lib/catalog.ts`, `components/catalog.tsx`, `variant-picker.tsx`, `product-gallery.tsx`, both new pages, the collection-page diff and the `product-card` diff. Filters are URL-driven through a plain GET form (works without JS), unknown sort values fall back to Featured, array params collapse to the first value, and all queries go through Prisma so there is no injection surface. The empty state distinguishes "collection being prepared" from "no matches" and offers clear actions; the result count is a polite status. Product pages handle the no-variant case, and the picker keeps colour/size/sold-out selection accessible with `aria-pressed` and a live availability line. Production smoke on `:3210`: `/products` (24 cards), `?size=M` (13), `?size=S` (11), `?availability=sold-out` (0, empty state), `?price=over-250&sort=price-asc` (5), `/products/wool-overcoat` (200, 4 related), `/collections/atelier-noir?colour=Ink&availability=in-stock` (3) all return 200. Direct SQLite check: 99 variants, 5 with zero stock, no fully sold-out product in the seed. Only project files touched, no `.github` changes, no secrets, demo data synthetic, README voice clean. Approved, no blocking findings.
- Non-blocking notes: an unknown product slug (`/products/nope-xyz`) renders the not-found body but returns 200, the same streaming limitation as collections; tracked as `P01-3-r1`. Availability "All pieces" plus a size/colour still requires `stock > 0`, so sold-out matches are hidden; recorded as `P01-3-r2` for a decision. The Add to bag button becomes enabled when a size is in stock but has no handler yet; the note under it explains this and cart work `P01-4` will wire it, so no item was added.

### P01-4a · round 1 — Build the persistent bag

- **Built:** 18 Nov 2026, 23:26 UTC
- **Commit:** `75b799b` — P01-4a: build the persistent bag
- **Scope:** Server-backed cart keyed by an HttpOnly cookie; add-to-bag on the product page with stock feedback, quantity steppers and remove with server-enforced stock limits, header bag count, empty and loading states
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:setup`; production smoke test of `/cart` empty and populated via a seeded cookie (200, correct count and totals; product page 200)
- **Review:** approved

- **Reviewed:** 18 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npx prisma validate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; the build emits `/cart` as a dynamic route. Read `app/cart/actions.ts`, `app/cart/page.tsx`, `app/cart/loading.tsx`, `lib/cart.ts`, `components/add-to-bag.tsx` and the `layout`, `site-header`, `variant-picker` diffs. Correctness: add-to-bag binds the selected variant through `useActionState`, the server clamps the new quantity to `min(stock, MAX_PER_LINE)`, quantity edits and removals are scoped to the cookie's cart, and the empty state plus a `loading.tsx` skeleton are present (the root `app/error.tsx` covers failures). Verified behaviourally against a production `next start` on `:3456` with SQLite fixtures: `/`, `/products/wool-overcoat` and `/cart` return 200 with an empty bag; a seeded cart renders "2 pieces", `$840` subtotal and "Bag, 2 items" in the header; the real no-JS update form raised quantity 2→5, clamped a request of 100 to the 10-per-line cap, clamped a request of 9 to a stock of 2, left the line untouched when posted with a foreign cookie, and the remove form deleted it. A wrong cookie reads as an empty bag. Safety: HttpOnly/SameSite=lax cookie, no token in the URL, server-side stock and cart-membership checks, no secrets, synthetic data, only project files touched, README voice clean. No blocking findings. Non-blocking: `addToCart` reports "added" even when reduced stock forces the quantity down, and the empty `Cart` row lingers after the last line is removed (harmless; both are cosmetic). Note for `P01-4b`: there is no automated test file for the cart yet, consistent with earlier items.

### P01-4b · round 1 — Build checkout

- **Built:** 19 Nov 2026, 14:23 UTC
- **Commit:** `9018ca0` — P01-4b: add checkout with mock payment
- **Scope:** `/checkout` with contact and shipping forms, mock card step, live order summary, server-side field validation, discount-code apply/remove (`WELCOME10`, `ATELIER25`) revalidated at order time, atomic order creation with line snapshots, variant stock decrement and bag clear, confirmation at `/checkout/[orderNumber]`, cart entry point when stock allows
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; verified `$transaction` support and rollback against the seeded SQLite database with a throwaway script
- **Review:** approved

- **Reviewed:** 19 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `cp .env.example .env`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; the build emits `/checkout` and `/checkout/[orderNumber]` as dynamic routes. Read `checkout/actions.ts`, `lib/checkout.ts`, `checkout/page.tsx`, `checkout/[orderNumber]/page.tsx`, `components/checkout-form.tsx`, the cart-page diff and the `Order`/`OrderItem`/`Cart`/`Address` schema. Correctness: every cart line, the discount and the stock are re-read inside one `$transaction`; each variant decrement is guarded by `updateMany({ stock: { gte: quantity } })` and rolls back via `OrderError`, the order stores line snapshots plus discount/shipping/total in minor units, the bag row is deleted (items cascade) and the cookie cleared before the redirect, and the confirmation reads the persisted order with its snapshots. Exercised `evaluateDiscount`/`validateCheckout` directly against seeded data: `WELCOME10` rejects 9,999 and gives 1,000 off from 10,000; `ATELIER25` rejects 24,999 and gives 2,500 from 25,000; an unknown code fails; an expired card, bad card length and bad email each return the right field error; shipping is 850 under 15,000 and free at the threshold. Production `next start` (:3488) smoke: `/` and empty `/checkout` 200; a seeded `maison_cart` renders the order summary, both demo codes and the Place order button; `/checkout/MS-1001` renders the confirmation with number, totals, delivery address and "Order confirmed". Safety: no card field is persisted or logged, discount and stock are enforced server-side, the cookie stays HttpOnly, data is synthetic, nothing outside the project changed, no `.github` or `LICENSE` edits. Honesty: the README walkthrough, discount terms and architecture note match the code; no agent/automation talk. Empty, loading (`app/loading.tsx`) and error (`app/error.tsx`) states are covered and form fields have real labels and `aria-invalid`/`aria-describedby`. No blocking findings. Non-blocking notes: the confirmation route is public and the order number is timestamp+4-hex, so it is guessable — worth gating behind the accounts work (`P01-5`) or switching to an unguessable token; the uncontrolled discount input keeps its text after "Remove code" even though the applied discount is cleared; `/checkout/<missing>` returns HTTP 200 with the not-found body, tracked as `P01-4b-r1` alongside the same pre-existing issue on other routes.

### P01-5a · round 1 — Accounts foundation

- **Built:** 20 Nov 2026, 13:55 UTC
- **Commit:** `77efdd8` — P01-5a: add account sign-in and sessions
- **Scope:** scrypt password hashing, signed HttpOnly session cookie, sign-in and registration pages with server-side validation, header account entry, signed-in account page and sign-out, seeded demo password
- **Checked by builder:** `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build`; a throwaway script confirmed the seeded hash accepts `Maison2026!` and rejects a wrong password
- **Review:** changes requested

- **Reviewed:** 20 Nov 2026
- **Verdict notes:** Re-ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck` and `npm run build` in `projects/01-maison-store` — all pass. Read the full `77efdd8` diff. The hashing, signed cookie, session lifetime, server-side validation, pending/error states and accessible form wiring are sound, and the README no longer over-claims. Two defects block approval:
  1. **Registration dead-ends for a customer created by guest checkout.** `checkout/actions.ts:238-249` creates a `Customer` with `passwordHash: null` for any guest order, but `account/actions.ts:107-116` rejects registration for *any* existing email. A shopper who checked out as a guest can then neither register nor sign in (sign-in fails because the hash is null). Fixed looks like: in `signUp`, when the existing row has `passwordHash === null`, set the name and new hash on that row and sign in; only report "already exists" when a hash is present. Keep the email-unique check.
  2. **A fixed, published session-signing secret.** `src/lib/auth.ts:10-11` falls back to the literal `maison-demo-session-secret-change-me` (also in `.env.example:9`), so an unconfigured deployment can have sessions forged for any customer id. The zero-config demo behaviour is worth keeping, but the fallback must not be a known constant: generate a random per-process secret when `AUTH_SECRET` is unset (cookies then die on restart, which is fine for a demo) or require the env var. Do not commit a usable secret.

  Minor, not blocking: sign-in does not cap password length before running scrypt (`account/actions.ts:25-32`), so a very long string is hashed; mirror the 128-character cap from registration.

### P01-5a · round 2 — Accounts foundation

- **Built:** 20 Nov 2026, 23:06 UTC
- **Commit:** `a8b9d2b` — P01-5a: fix guest registration and session secret
- **Scope:** Registration claims a guest-checkout customer row (null password hash) by setting the name and new hash instead of refusing; session cookies fall back to a random per-process secret when `AUTH_SECRET` is unset and `.env.example` no longer ships a usable constant; sign-in rejects passwords over 128 characters before hashing. Resolves round 1 findings 1 and 2 plus the minor password-length note.
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke was run.
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —

### P01-5a-r1 · round 1 — Guest-checkout registration

- **Built:** 20 Nov 2026, 23:06 UTC
- **Commit:** `a8b9d2b` — P01-5a: fix guest registration and session secret
- **Scope:** `signUp` now updates an existing customer with a null password hash, setting the submitted name and new hash, then signs in; "already exists" is returned only when a hash is present.
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke was run.
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —

### P01-5a-r2 · round 1 — Session secret fallback

- **Built:** 20 Nov 2026, 23:06 UTC
- **Commit:** `a8b9d2b` — P01-5a: fix guest registration and session secret
- **Scope:** With `AUTH_SECRET` unset, a random per-process secret is generated; `.env.example` documents the empty default instead of a published constant.
- **Checked by builder:** `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke was run.
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —
