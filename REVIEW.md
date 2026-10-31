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
- **Review:** needed

- **Reviewed:** —
- **Verdict notes:** —
