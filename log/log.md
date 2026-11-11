# Session log

Append-only. One entry per agent session, newest at the bottom. Both roles write here.

**Format**

```markdown
## 31 Oct 2026, 08:12 UTC · builder · run 1928374655
- Batch: 2 items (limit 2)
- P04-1 built, commit a1b2c3d, handed to review
- P04-2 built, commit d4e5f6a, handed to review
- Landed on work. Next unchecked item: P04-3.
```

```markdown
## 31 Oct 2026, 08:52 UTC · reviewer · run 1928374655
- Reviewed: P04-1 approved · P04-2 changes requested (2 follow-ups added)
- Re-ran: npm run lint, npm run typecheck, npm run build
- Landed verdicts on work. Next review: P04-3.
```

Rules: one entry per session, written at the end. Say what actually happened, including a run that did nothing. Never rewrite an older entry.

---

<!-- entries below, newest at the bottom -->

_No sessions logged yet._

- 31 Oct 2026, 19:46 UTC · reviewer · run 41234024072 — review queue empty; nothing to review.

## 31 October 2026, 04:29 UTC · reviewer · run 41166837673
- Review queue empty: no `Review: needed` entries in REVIEW.md — no checks run, no verdicts, nothing landed.

## 31 Oct 2026, 04:27 UTC · builder · run 41166837673
- Batch: 1 item (stopped at 1 — clock; P04-2 not started)
- P04-1 built, commit 3130235, handed to review
- Landed on work (fast-forward to fd0b5e7). Next unchecked item: P04-2.

## 31 October 2026, 19:44 UTC · builder · run 41234024072

## 9 Nov 2026, 14:19 UTC · builder · run 42631910817
- Batch: 1 item
- P04-3 built, commit b957459, handed to review
- Landed on work (fast-forward to dfd3ecf). Next unchecked item: P04-4.
- Batch: 1 item (limit 2; stopped at 1 — P04-3 too large to start with the time left)
- P04-2 built, commit ae7ba8e, handed to review
- Landed on work (fast-forward to 17ed311). Next unchecked item: P04-3.
- Checked: npm run lint, npm run typecheck, npm run build, npm run db:setup; production-server smoke test of the auth gate and department scoping.

## 5 November 2026 · owner · maintenance, no build session
- No build items ran: the model allowance for the runner's default identity has answered 429 "Free usage limit reached" on every scheduled run since 31 Oct. Nothing to review either — REVIEW.md still holds P04-1 and P04-2.
- Cadence cut to two slots a day (05:00, 17:00 UTC) and one build item per batch. A metered allowance is spent per request, and a 20-minute batch that finishes an item costs less than a 45-minute one that half-finishes two.
- Reviewer now runs `always()` and checks out `origin/work`; agent steps are `continue-on-error` with their own timeouts so a dead model call cannot eat the job or skip the landing sweep. A quota probe skips the batch on HTTP 429 instead of retrying for the whole job.
- Skills added under `.opencode/skills/`: `frugal-session`, `token-budget`, and vendored `impeccable` 4.8.0 (pbakaus, Apache-2.0, launcher not bundled) and `frontend-design` (anthropics/skills, Apache-2.0). Builders load one design skill for UI items; reviewers use the critique playbook to report, not redesign.
- Checked whether the free allowance resets: it does not come back. The quota probe now runs anonymously when there is no key and gets 429 in about a second; `Retry-After` resolves to end of the UTC day and is identical for no auth, a bogus token and a junk token, so it is a wall-clock boundary rather than a countdown. The 05:00 UTC slot has been firing five hours after that boundary and still 429s, and the 10:09 UTC run burned a full hour retrying before the job timed out. The quota step therefore probes in both modes and skips the batch on 429.
- Added a free route that needs no card: `google/*` via a Google AI Studio key in `GEMINI_API_KEY`, with `google/gemini-3.5-flash-lite` picked automatically once that secret exists. The probe understands the Gemini free tier (429 means the project's day is spent, resetting at midnight Pacific; 400/403 means the key is wrong) and the workflow stays on the opencode gateway if an OPENCODE_API_KEY appears. Tested the chooser against five secret/input combinations and the probe against four models.
- Still waiting on a working model credential before the next build session. Next unchecked item: P04-3.

## 9 November 2026 · owner · maintenance, no build session
- Seven scheduled runs since 5 Nov all ended success in about 20 seconds and did no work: the logs show `quota probe HTTP 429 (identity: anonymous)`, then the builder and reviewer skip. No commits, no `opencode/*` branches, `work` and `main` both still at df17181.
- The repo still has no secrets, and the scheduled slots are landing 4-7 hours late: 05:00 UTC slots started at 11:33-12:45, 17:00 UTC slots at 20:42-21:58. The 9 Nov 05:00 slot had not started by 13:26 UTC.
- Removed the Google route on the owner's decision. Scheduled runs are opencode-only again: the chooser no longer falls back to a Gemini model, and the probe speaks only to the opencode gateway.
- What unblocks a run, per the OpenCode docs: signed out, the `opencode` provider is not exposed at all, so an anonymous runner can never reach those models. An API key from opencode.ai -> Console -> API keys, added as `OPENCODE_API_KEY`, restores them, and the free `opencode/*-free` models cost nothing per token.
- Review queue is still 2 entries: P04-1 (3130235) and P04-2 (ae7ba8e), both `Review: needed`. Next unchecked item: P04-3.

## 10 November 2026, 01:02 UTC · reviewer · run 42729354012
- Reviewed: P04-3 approved (attempt 1).
- Re-ran: `npm install`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build`; production smoke on :3510 — unauth /leads 307 → /login, owner CRM pages 200, staff CRM pages scoped.
- Cleared a stale P04-2 checkpoint (item already approved, branch gone).
- Landed verdict on work. Review queue empty. Next unchecked item: P04-4.

## 10 November 2026, 13:43 UTC · reviewer · run 42823181119
- Reviewed: none — REVIEW.md has no entry marked `Review: needed` (P04-1, P04-2, P04-3 all approved). Nothing changed.
- Next unchecked item: P04-4.

## 10 November 2026, 22:38 UTC · reviewer · run 42912078601
- Reviewed: none — REVIEW.md has no entry marked `Review: needed` (P04-1, P04-2, P04-3 all approved). No checks run, nothing changed.
- Next unchecked item: P04-4.

## 11 November 2026, 12:55 UTC · reviewer · run 43020806853
- Reviewed: none — REVIEW.md has no entry marked `Review: needed` (P04-1, P04-2, P04-3 all approved). No checks run, nothing changed.
- Next unchecked item: P04-4.
