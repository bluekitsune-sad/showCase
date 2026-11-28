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

## 11 November 2026, 23:28 UTC · builder · run 43119149482
- Batch: 1 item (limit 1)
- P04-4 built, commit bd3f861, handed to review (cb2a822)
- Added employee directory, attendance check-in/out, leave request/decision, recruitment pipeline; typecheck, lint and build pass
- Landed on work. Next unchecked item: P04-5.

## 12 November 2026, 13:39 UTC · builder · run 43228578675
- Batch: 1 item (limit 1)
- P04-5 built, commit 39f8234, handed to review (f03115f)
- Added projects list, task board with assignee/due dates, notifications feed, and activity log plus notifications on task/project mutations; typecheck, lint, build and prisma validate pass; owner pages smoke-tested on a seeded database
- Landed on work. Next unchecked item: P04-6.

## 12 November 2026, 13:42 UTC · reviewer · run 43228578675
- Reviewed: P04-4 approved (commit bd3f861)
- Re-ran: npm ci, npm run db:setup, npm run lint, npm run typecheck, npm run build — all pass
- Runtime smoke on :3520: owner 200 on all four HR routes; anonymous /leave 307 to login; staff saw only their own leave with the own-records label; staff /recruitment access-denied
- Landed verdict on work. Next review: P04-5.

## 12 November 2026, 22:41 UTC · builder · run 43321608363
- Batch: 1 item (limit 1)
- Split P04-6 into P04-6a-d: dashboard trends, reports + CSV, audit viewer, responsive/README pass
- P04-6a built, commit 6eb5880, handed to review (070851d)
- Added attendance-rate KPI, six-month pipeline-created chart and 14-day attendance-rate chart from department-scoped data; `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck` and `npm run build` pass; no browser runtime smoke
- Landed on work. Next unchecked item: P04-6b.

## 13 November 2026, 12:59 UTC · builder · run 43428980485
- Batch: 1 item (limit 1)
- P04-6b built, commit e387a75, handed to review (2180f28)
- Added `/reports` with server-side `report.view` gate, UTC date ranges, department-scoped pipeline/headcount/attendance/task tables and empty states; `/reports/export` re-checks permission and returns CSV for each report; Reports nav entry enabled
- Ran `npm ci`, `npm run db:generate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; runtime query smoke showed owner and manager totals differ as expected; no browser session smoke
- Landed on work. Next unchecked item: P04-6c.

## 13 November 2026, 13:04 UTC · reviewer · run 43428980485
- Batch: 3 reviews (P04-5, P04-6a, P04-6b)
- Reviewed: P04-5 approved, P04-6a approved, P04-6b approved
- Re-ran in projects/04-nexus-business-suite: npm ci, npm run db:setup, npm run lint, npm run typecheck, npm run build — all pass
- Runtime smoke on :3520 (signed cookies): staff and manager task scoping held with no cross-department leak; owner and staff dashboards 200; reports 200 for owner/manager, access-denied for staff, CSV export 200/403/401/400 as expected, owner vs manager CSV totals differed
- Landed all three verdicts on work. Review queue empty. Next review: none (next TODO: P04-6c).

## 13 November 2026, 13:20 UTC · reviewer · run 43518981742
- Batch: 0 reviews — review queue empty; nothing to review.
- No `Review: needed` entry in `REVIEW.md`; no open builder branches on origin.
- Left the checkpoint (idle) untouched. Next review: none (next TODO: P04-6c).

## 14 November 2026, 12:03 UTC · builder · run 43592444701
- Batch: 1 item (limit 1)
- P04-6c built, commit 8d20ac7, handed to review (40f8088)
- Added `/activity` audit viewer with a server-side `activity.read` gate, summary/entity/action/actor/date filters, 25-row pagination, empty and access-denied states; Activity log nav item enabled
- Ran `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; seeded Prisma query returned 80 rows, 7 actions, 18 actors and a 25-row first page; no browser session smoke
- Landed on work. Next unchecked item: P04-6d.

## 14 November 2026, 12:08 UTC · reviewer · run 43592444701
- Reviewed: P04-6c approved (1 entry)
- Re-ran: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass
- Runtime smoke on `npm run start` (:3521): owner `/activity` 200 (80 entries), staff access-denied, unauthenticated 307 to `/login`, unmatched filter empty state
- Landed verdict on work. Next review: none (next TODO: P04-6d).

## 14 November 2026, 21:34 UTC · reviewer · run 43641261983
- Batch: 0 reviews — review queue empty; nothing to review.
- No `Review: needed` entry in the `REVIEW.md` queue; left the checkpoint (idle) untouched. Next review: none (next TODO: P04-6d).

## 15 November 2026, 12:35 UTC · builder · run 43714384246
- Batch: 1 item (P04-6d).
- P04-6d: skip link and focusable main region, mobile drawer close/Escape/`aria-expanded` with closed drawer out of the tab order, captions on every data table, Nexus README case study and Shipped status; commit `a8cbb05`, handed to review.
- Ran `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke.
- Landed on work. Next unchecked item: P01-1.

## 15 November 2026, 12:37 UTC · reviewer · run 43714384246
- Reviewed: P04-6d approved (1 entry); added follow-up `P04-6d-r1` for drawer focus management.
- Re-ran: `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass.
- Checked skip link/main target, drawer close/Escape/overlay/link dismissal, `aria-expanded`, `invisible` vs `lg:visible`, captions and scoped headers on all 8 tables, README seed/states/dark-mode claims, root Shipped row.
- Landed verdict on work. Next review: none (next TODO: P01-1).

## 15 Nov 2026, 21:33 UTC · builder · run 43763954008
- Batch: 1 item (limit 1)
- P04-6d-r1 built, commit 17566f8, handed to review
- Landed on work. Next unchecked item: P01-1.

## 15 Nov 2026, 21:36 UTC · reviewer · run 43763954008
- Reviewed: P04-6d-r1 approved (1 entry)
- Re-ran: `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass
- Verified drawer focus move/trap/restore and the inert background by reading the diff; no browser smoke available for client focus
- Landed verdict on work. Next review: none (next TODO: P01-1).

## 16 November 2026, 13:50 UTC · reviewer · run 43875420235
- Batch: 0 reviews — review queue empty; nothing to review.
- No `Review: needed` entry in the `REVIEW.md` queue; left the checkpoint (idle) untouched. Next review: none (next TODO: P01-1).

## 17 November 2026, 01:06 UTC · reviewer · run 43989567552
- Batch: 0 reviews — review queue empty; nothing to review.
- No `Review: needed` entry in the `REVIEW.md` queue (only explanatory references to the marker); left the checkpoint (idle) untouched. Next review: none (next TODO: P01-1).

## 17 November 2026, 14:19 UTC · builder · run 44100144977
- Batch: 1 item
- P01-1 built, commit 7574b4a, handed to review
- Checks: `npm install`, `prisma migrate dev`, seed, `npm run lint`, `npm run typecheck`, `npm run build`, production smoke of `/`, `/collections`, `/collections/atelier-noir` and `/cart`
- Landed on work. Next unchecked item: P01-2.

## 17 November 2026, 23:53 UTC · builder · run 44202222456
- Batch: 1 item
- P01-2 built, commit 240a790, handed to review
- Checks: `npm install`, `prisma migrate dev --name home_content`, seed, `npm run lint`, `npm run typecheck`, `npm run build`, production smoke of the home page
- Landed on work. Next unchecked item: P01-3.

## 17 November 2026, 23:59 UTC · reviewer · run 44202222456
- Reviewed: P01-1 approved · P01-2 approved (2 entries; follow-up `P01-1-r1` added for the unknown-slug 200)
- Re-ran: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass
- Runtime smoke on `:3600`: home, collections, both seeded collections and the bag return 200 with seeded content; unknown collection slug renders the not-found body but still returns 200
- Cosmetic doc fix during review: project README seed-determinism sentence now notes order dates are relative to the seed day
- Landed verdicts on work. Next review: none (next TODO: P01-3).

## 18 November 2026, 13:54 UTC · builder · run 44316251094
- Batch: 1 item
- P01-3 built, commit ab486ce, handed to review
- Added URL-driven sort/filter on collection pages and a new `/products` catalogue; product pages with gallery, variant stock picker, size guide and related pieces
- Checks: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build`, production smoke of `/products`, a filtered catalogue, a product page and a filtered collection — all pass
- Known: unknown product slugs render the not-found body with HTTP 200, same streaming limit as `P01-1-r1`
- Landed on work. Next unchecked item: P01-4.

## 18 November 2026, 14:07 UTC · reviewer · run 44316251094
- Reviewed: P01-3 approved (1 entry; follow-ups `P01-3-r1` product-slug 404 and `P01-3-r2` availability/size semantics)
- Re-ran: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass
- Runtime smoke on `:3210`: `/products` 24 cards, `?size=M` 13, `?size=S` 11, `?availability=sold-out` 0 with empty state, `?price=over-250&sort=price-asc` 5, product page 200 with 4 related, filtered collection 3; unknown product slug renders not-found body but returns 200 (tracked)
- SQLite check: 99 variants, 5 zero-stock, no fully sold-out product in seed
- Landed verdict on work. Next review: none (next TODO: P01-4).

## 18 Nov 2026, 23:27 UTC · builder · run 44419448086
- Batch: 1 item (P01-4 split into P01-4a bag / P01-4b checkout before starting)
- P01-4a built, commit 75b799b, handed to review
- Re-ran: npm run lint, npm run typecheck, npm run build, npm run db:setup; production smoke test of /cart empty and populated (200, correct totals)
- Landed on work. Next unchecked item: P01-4b (after P01-4a review).

## 18 Nov 2026, 23:30 UTC · reviewer · run 44419448086
- Reviewed: P01-4a approved (1 entry; no follow-ups needed)
- Re-ran: `npm ci`, `npx prisma validate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass
- Functional smoke on `:3456` with SQLite fixtures: `/`, product page, `/cart` empty all 200; seeded cart shows "2 pieces", `$840` subtotal, header "Bag, 2 items"; no-JS update form 2→5, 100→10 line cap, 9→2 stock clamp, foreign cookie no-op, remove deletes
- Non-blocking: "added" message when stock-clamped down; empty `Cart` row lingers after last removal
- Landed verdict on work. Next review: none (next TODO: P01-4b).

## 19 Nov 2026, 14:24 UTC · builder · run 44540861095
- Batch: 1 item (limit 1)
- P01-4b built, commit `9018ca0`, handed to review (checkout, mock payment, discount validation, atomic order write, confirmation)
- Re-ran: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; checked transaction support and rollback with a throwaway script
- Landed on work at `99bfd3f` (fast-forward). Next unchecked item: P01-5.

## 19 Nov 2026, 14:45 UTC · reviewer · run 44540861095
- Reviewed: P01-4b approved (1 entry; 1 follow-up added: P01-4b-r1)
- Re-ran: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` in `projects/01-maison-store` — all pass; build emits `/checkout` and `/checkout/[orderNumber]`
- Logic checked directly: discount thresholds (WELCOME10 9,999 reject / 10,000→1,000 off; ATELIER25 24,999 reject / 25,000→2,500 off), unknown code, expired/bad card, bad email, shipping 850→0 at 15,000
- Smoke on `:3488`: `/`, empty `/checkout` 200; seeded cart renders summary + demo codes + Place order; `/checkout/MS-1001` renders confirmation with totals and address
- Non-blocking: public confirmation page with guessable order number (gate in P01-5 or use a token); discount input text lingers after Remove code
- Landed verdict on work. Next review: none (next TODO: P01-5).

## 19 Nov 2026, 23:51 UTC · reviewer · run 44637599001
- Reviewed: nothing — review queue has no `Review: needed` entries (newest is P01-4b, already approved)
- No checks run, no verdicts, nothing to land. Next review: none (next TODO: P01-5).

## 20 Nov 2026, 13:56 UTC · builder · run 44748098599
- Batch: 1 item; P01-5 split into P01-5a to P01-5d first
- P01-5a built, commit 77efdd8, handed to review
- Checks in `projects/01-maison-store`: `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; seeded demo password hash verified
- Landed on work. Next unchecked item: P01-5b.

## 20 Nov 2026, 14:05 UTC · reviewer · run 44748098599
- Reviewed: P01-5a changes requested (2 follow-ups added: P01-5a-r1, P01-5a-r2)
- Findings: guest-checkout customers with a null password hash cannot register; published fallback session secret allows cookie forgery when `AUTH_SECRET` is unset
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass
- Landed verdict on work. Next review: none (P01-5a back with the builder).

## 20 Nov 2026, 23:00 UTC · builder · run 44833258838
- Batch: 1 item — P01-5a redo, also closing follow-ups P01-5a-r1 and P01-5a-r2
- P01-5a fixed, commit a8b9d2b, handed to review (round 2); r1 and r2 marked done
- Fixed: guest-checkout rows claimed on registration; random per-process session secret when `AUTH_SECRET` is unset; sign-in password capped at 128 characters
- Checks in `projects/01-maison-store`: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser session smoke run
- Landed on work. Next unchecked item: P01-5b.

## 20 Nov 2026, 23:05 UTC · reviewer · run 44833258838
- Reviewed: P01-5a round 2 approved · P01-5a-r1 approved · P01-5a-r2 approved (commit a8b9d2b)
- Re-ran: npm ci, npm run db:setup, npm run lint, npm run typecheck, npm run build — all pass
- Checked guest-claim registration path and per-process session secret; no findings
- Landed verdicts on work. Next review: queue empty.

## 21 Nov 2026, 13:22 UTC · builder · run 44907997400
- Batch: 1 item — P01-5b
- P01-5b built, commit dd774ac, handed to review
- Added recent orders to the account home, `/account/orders`, and `/account/orders/[orderNumber]` scoped to the signed-in customer; per-item status and a derived tracking timeline; `OrderItem.status` migration and seed
- Checks in `projects/01-maison-store`: `npx prisma validate`, `npx prisma generate`, `npm run lint`, `npm run typecheck`, `npm run build`, `prisma db push`, `npm run db:seed` — all pass; verified Ada's orders and item statuses in SQLite, no browser click-through
- Landed on work. Next unchecked item: P01-5c.

## 21 Nov 2026, 13:24 UTC · reviewer · run 44907997400
- Reviewed: P01-5b round 1 approved (commit dd774ac)
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass
- Checked customer-scoped order queries, empty/not-found states, timeline for delivered/in-transit/cancelled, seed and README claim; no findings
- Landed verdict on work. Review queue empty.

## 22 Nov 2026, 13:12 UTC · builder · run 45025804538
- Batch: 1 item — P01-5c
- P01-5c built, commit a79dcb9, handed to review
- Added `/account/addresses` list with empty state, add/edit forms, delete and set-default actions; server-side validation and customer-scoped writes; one default address kept across changes; account-home link and README update
- Checks in `projects/01-maison-store`: `npm install`, `npx prisma generate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; no browser click-through
- Landed on work. Next unchecked item: P01-5d.

## 22 Nov 2026, 13:18 UTC · reviewer · run 45025804538
- Reviewed: P01-5c round 1 approved (commit a79dcb9)
- Re-ran in `projects/01-maison-store`: `npm install`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass
- Checked customer-scoped address reads/writes, server-side validation, one-default invariant across create/edit/delete, empty/loading/error states, seed and README claims; no findings
- Runtime smoke: unauthenticated `/account/addresses` redirects to `/account/sign-in`
- Landed verdict on work. Review queue empty. Next unchecked item: P01-5d.

## 22 Nov 2026, 22:21 UTC · reviewer · run 45077164994
- Batch: 0 reviews — review queue empty; nothing to review.
- No `Review: needed` entry in the `REVIEW.md` queue (only the two explanatory references to the marker); left the checkpoint (idle) untouched. Next review: none (next TODO: P01-5d).

## 23 Nov 2026, 15:48 UTC · builder · run 45208503934
- Batch: 1 item (limit 1)
- P01-5d built, commit e6b3329, handed to review (commit 370269a)
- Added customer-scoped wishlist server actions, a save control on the product page with a guest sign-in prompt, a `/wishlist` page with empty and guest states, and header/account links; README updated
- Checks in `projects/01-maison-store`: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `DATABASE_URL=file:./prisma/dev.db npm run build` — all pass; no browser click-through
- Landed on work. Next unchecked item: P01-6.

## 24 Nov 2026, 03:21 UTC · builder · run 45317647054
- Batch: 1 item (limit 1)
- P01-6 split into P01-6a..e; P01-6a built, commit 2951327, handed to review (commit 438801b)
- Added storefront SEO metadata, Open Graph and JSON-LD, plus noindex on private routes
- Checks in `projects/01-maison-store`: `npm ci`, `npm run db:generate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; production smoke confirmed canonical links, JSON-LD types and the cart noindex tag
- Landed on work. Next unchecked item: P01-6b.

## 24 Nov 2026, 03:55 UTC · reviewer · run 45317647054
- Batch: 2 reviews (limit 3)
- Reviewed: P01-5d approved (commit e6b3329) · P01-6a approved (commit 2951327)
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `DATABASE_URL=file:./prisma/dev.db npm run build` — all pass; production smoke on :3541 confirmed wishlist scoping plus Product/CollectionPage/Breadcrumb/Organization/WebSite JSON-LD, canonical tags and `noindex, nofollow` on cart and wishlist
- Landed verdicts on work. Review queue empty. Next build item: P01-6b.

## 24 Nov 2026, 15:42 UTC · builder · run 45427316337
- Batch: 1 item (limit 1)
- P01-6b built, commit 4df8fd7, handed to review (commit 62bf468)
- Added a shared `ProductMedia` component: `next/image` with responsive sizes and priority when a photo URL exists, accessible gradient placeholders otherwise; wired into product cards, the product gallery, home featured/collection panels and the collections index
- Checks in `projects/01-maison-store`: `npm ci`, `npm run db:generate`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. No browser click-through was run.
- Landed on work. Next unchecked item: P01-6c.

## 24 Nov 2026, 15:48 UTC · reviewer · run 45427316337
- Batch: 1 review (limit 3)
- Reviewed: P01-6b approved (commit 4df8fd7)
- Re-ran in `projects/01-maison-store`: `npm ci`, `DATABASE_URL=file:./prisma/dev.db npm run db:setup`, `npm run lint`, `npm run typecheck`, `DATABASE_URL=file:./prisma/dev.db npm run build` — all pass. No browser click-through.
- Checks: `ProductMedia` fills a positioned parent in both branches; placeholder carries `role="img"` + descriptive label; gallery main image uses priority and responsive sizes; gallery query selects `url`. Seeded image URLs are null by design, and local `public/` paths are the documented photo route (no remote hosts configured).
- Landed verdict on work. Review queue empty. Next build item: P01-6c.

## 25 Nov 2026, 01:18 UTC · builder · run 45524500006
- Batch: 1 item (limit 1)
- P01-6c built and handed to review, commit 826f326 (handoff 91d9a7b)
- Added route loading skeletons for products, product detail, collections, collection detail, account and checkout; account and checkout error boundaries; order-specific not-found pages for account order detail and checkout confirmation
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. No browser click-through.
- Landed on work. Next unchecked item: P01-6d.

## 25 Nov 2026, 01:25 UTC · reviewer · run 45524500006
- Batch: 1 review (limit 3)
- Reviewed: P01-6c approved (commit 826f326)
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `DATABASE_URL=file:./prisma/dev.db npm run build` — all pass.
- Checks: six route loading skeletons with `aria-busy` + `sr-only` status, account/checkout client error boundaries with reset, and order-specific `noindex` not-found pages; both order pages still call `notFound()`. Smoke on `:3566`: `/checkout/MS-9999` rendered the new not-found body (HTTP 200 — the pre-existing streaming limitation tracked in P01-4b-r1) and `/products` returned 200.
- Landed verdict on work. Review queue empty. Next build item: P01-6d.

## 25 Nov 2026, 15:32 UTC · builder · run 45644058948
- Batch: 1 item (limit 1)
- P01-6d built and handed to review, commit 8a1ddc8 (handoff 587e0d2)
- Accessibility pass: darkened the subtle-text token and added a control-border token for contrast, added an invalid-field border, returned focus to the header menu triggers on Escape, set the sticky-header anchor offset, extended reduced-motion to animations, and labelled product-card colours for screen readers
- Re-ran in `projects/01-maison-store`: `npm ci`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass. No browser click-through or automated axe run.
- Landed on work. Next unchecked item: P01-6e.

## 26 Nov 2026, 00:56 UTC · builder · run 45731689633
- Batch: 1 item (limit 1)
- P01-6e built and handed to review, commit ec833bf (handoff a56dca9)
- Added real home, catalogue and product screenshots to `public/screenshots/` and a Screenshots section to the project README; aligned the definition-of-done setup step with `npm run db:setup` / `npm run dev` and re-checked the demo account, discount codes and order states against `prisma/seed.ts`
- Ran in `projects/01-maison-store`: `npm install`, `cp .env.example .env`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `npm run build` — all pass; `npm start` smoke on `/`, `/products`, `/products/wool-overcoat` all 200 before capturing the screenshots
- Landed on work. Next unchecked item: P01-1-r1.

## 26 Nov 2026, 01:00 UTC · reviewer · run 45731689633
- Batch: 2 reviews (limit 3)
- Reviewed: P01-6d approved (commit 8a1ddc8) · P01-6e approved (commit ec833bf)
- Re-ran in `projects/01-maison-store`: `npm ci`, `cp .env.example .env`, `npm run db:setup`, `npm run lint`, `npm run typecheck`, `DATABASE_URL=file:./prisma/dev.db npm run build` — all pass.
- P01-6d: computed contrast (ink-subtle 5.35:1 paper, line-control 3.17:1 paper / 3.47:1 surface), confirmed form labels + `aria-invalid` borders, Escape focus return for both header menus, skip link and landmarks, reduced-motion. No findings.
- P01-6e: verified three real 1440×900 PNG captures (home, catalogue, product) against their captions, README voice clean, setup line matches the shipped scripts, demo account/discounts/orders match `prisma/seed.ts`. No findings.
- Landed both verdicts on work. Next review: none pending.

## 26 Nov 2026, 15:13 UTC · reviewer · run 45842544543
- Batch: 0 reviews — REVIEW.md has no entry marked `Review: needed`; every entry is approved or changes requested and the last verdicts (P01-6d, P01-6e) already landed on work in f8d9ce5.
- Cleared the stale `reviewing` checkpoint left by run 45731689633 (its branch is gone and its verdicts are landed) and set the checkpoint to idle.
- Ran no project checks because nothing was reviewed.

## 27 Nov 2026, 01:23 UTC · reviewer · run 45919746593
- Batch: 0 reviews — REVIEW.md has no entry marked `Review: needed`; the newest verdicts (P01-6d, P01-6e) already landed in f8d9ce5 and no new build has been handed over.
- Ran no project checks because nothing was reviewed. Next unchecked builder item: P01-1-r1.

## 27 Nov 2026, 15:11 UTC · reviewer · run 46018773454
- Batch: 0 reviews — REVIEW.md has no entry marked `Review: needed`; every entry is approved or changes requested and no new build has been handed over since the last verdicts landed.
- Ran no project checks because nothing was reviewed. Next unchecked builder item: P01-1-r1.

## 28 Nov 2026, 00:26 UTC · builder · run 46087559950
- Batch: 1 item (P01-1-r1)
- P01-1-r1 built, commit 97c362c, handed to review: a Node-runtime proxy checks the collection slug and rewrites unknown slugs to the not-found route for a real 404.
- Ran npm ci, npm run db:setup, npm run lint, npm run typecheck, npm run build; production smoke on npm run start — /collections/does-not-exist → 404, valid collections and filters → 200.
- Landed on work. Next unchecked item: P01-3-r1.
