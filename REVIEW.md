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
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —

### P04-3 · round 1 — Build the CRM surface

- **Built:** 9 Nov 2026, 14:18 UTC
- **Commit:** `b957459` — P04-3: build the CRM surface
- **Scope:** Leads list with search, stage/source filters and pipeline totals; lead pipeline board by stage with audited stage moves; customers list with search and status filters; customer detail with contacts, notes and activity timeline; server-side permission and department checks on every mutation
- **Checked by builder:** `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:setup`; production-server smoke test — `/leads`, `/pipeline`, `/customers`, `/customers/1` return 200 for the owner; unauthenticated `/leads` returns 307 to login; operations staff gets the not-found view for a sales-owned customer; stage move persisted with a `lead.stage_changed` activity entry; note creation persisted with a `note.added` activity entry; a staff stage-change POST left the lead unchanged
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —
