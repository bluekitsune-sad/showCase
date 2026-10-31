# PRD — Showcase Portfolio

| | |
| --- | --- |
| **Owner** | bluekitsune-sad |
| **Status** | Active — building |
| **Last updated** | 31 October 2026 |
| **Source of truth for work** | `TODO.md` |
| **Build conventions** | `AGENTS.md` |

---

## 1. Summary

A public portfolio repository containing **12 self-contained products**, each a working demo rather than a mockup: six categories, two projects per category, one aimed at individuals and small businesses, one aimed at larger organisations.

The repository is also a small software factory with two roles. A **builder** picks the next item from `TODO.md`, builds and verifies it, marks it `— review needed`, and lands it on `work`. A **reviewer** then re-runs the checks independently and either signs the item off or sends it back with findings. The owner merges `work` into `main` manually when satisfied.

**What success looks like:** a visitor opens the repo, clicks a project, and finds a running product with a real problem statement, realistic data, screenshots, and honest documentation. And the owner can add a line to `TODO.md` and have new work appear without touching code.

---

## 2. Problem and audience

### The problem this repository solves

A portfolio of tutorial apps proves nothing. Recruiters, clients and collaborators need evidence of judgement: can this person pick a real problem, design a coherent product, model data correctly, and ship something that holds up?

So every project here is framed as a client request ("I need a website", "I need a business application") and answered with a product that has an identity, seeded data, and a written case study.

### Audiences

| Audience | What they should take away |
| --- | --- |
| Prospective clients (small business) | "This person can build the thing I need, and it will look professional." |
| Prospective clients (enterprise) | "This person understands roles, audit trails, reporting and scale." |
| Hiring managers / technical reviewers | "The code is organised, typed, tested where it matters, and documented." |
| Other developers | "I can clone a project and run it in two minutes." |

---

## 3. Goals and non-goals

### Goals

1. **Twelve coherent products**, two per category, each with a distinct audience and a distinct problem.
2. **Every project runs locally from a clean clone** with one install and one start command, using seeded demo data.
3. **Every project has a case study README**: problem, approach, features, stack, screenshots, how to run, what was deliberately left out.
4. **A queue-driven build process**: `TODO.md` is the only place work is scheduled, and adding an item there is enough to get it built.
5. **A portfolio landing page** (root `README.md`) that a non-technical visitor can scan in one minute.
6. **Nothing embarrassing in the repo**: no secrets, no broken links, no half-merged experiments.

### Non-goals

- Production hosting, custom domains, or paid infrastructure for all twelve projects.
- Real payment processing, real LLM spend, or real customer data. Demos use mock mode by default.
- Active security testing against third-party systems. SecureCheck is passive and authorization-gated.
- Native app-store releases. Mobile projects run through Expo (web and dev client).
- A shared monorepo toolchain. Projects stay independent on purpose.

---

## 4. Portfolio structure

Six categories, each with a customer-facing project and a business-facing project.

| # | Category | Customer project | Business project |
| --- | --- | --- | --- |
| 1 | I need a website | Maison Store | Corporate Digital Presence |
| 2 | I need a business application | ShopFlow | Nexus Business Suite |
| 3 | I need a mobile app | CityBites | FieldForce |
| 4 | I have an AI idea | DocuMind | Enterprise Intelligence Hub |
| 5 | I need cybersecurity help | SecureCheck | CyberOps Command Center |
| 6 | I need something else | StorySpace | SimuWorks |

Every project card carries one of two labels: **For individuals & customers** or **For businesses & enterprises**.

---

## 5. The twelve projects

Each spec lives next to its code in `projects/<slug>/README.md`.

| ID | Project | Folder | Stack | Phase |
| --- | --- | --- | --- | --- |
| 01 | Maison Store | `projects/01-maison-store` | Next.js, TypeScript, Tailwind, Prisma | 1 |
| 02 | Corporate Digital Presence | `projects/02-corporate-cms` | Next.js, TypeScript, Node, RBAC | 3 |
| 03 | ShopFlow | `projects/03-shopflow` | Next.js, TypeScript, Prisma | 2 |
| 04 | Nexus Business Suite | `projects/04-nexus-business-suite` | Next.js, TypeScript, Prisma, RBAC | 1 |
| 05 | CityBites | `projects/05-citybites` | React Native, Expo, TypeScript | 3 |
| 06 | FieldForce | `projects/06-fieldforce` | React Native, Expo, TypeScript | 2 |
| 07 | DocuMind | `projects/07-documind` | Python, FastAPI, Next.js, RAG | 1 |
| 08 | Enterprise Intelligence Hub | `projects/08-enterprise-intelligence-hub` | Python, FastAPI, Next.js, jobs | 2 |
| 09 | SecureCheck | `projects/09-securecheck` | Python, FastAPI, Next.js | 1 |
| 10 | CyberOps Command Center | `projects/10-cyberops-command-center` | Next.js, TypeScript, Prisma, RBAC | 2 |
| 11 | StorySpace | `projects/11-storyspace` | Next.js, TypeScript, Prisma | 3 |
| 12 | SimuWorks | `projects/12-simuworks` | TypeScript, React, simulation | 3 |

### Phase order

- **Phase 1 — flagship work:** Nexus Business Suite, Maison Store, DocuMind, SecureCheck. These cover full-stack business logic, premium front-end, AI and security — the four strongest signals.
- **Phase 2 — breadth:** ShopFlow, FieldForce, Enterprise Intelligence Hub, CyberOps Command Center.
- **Phase 3 — range:** CityBites, Corporate Digital Presence, StorySpace, SimuWorks.

### Deliberate deviation from the original plan

- **SimuWorks** is built as a browser simulation (TypeScript/React) rather than Unity/C#. It must be clickable from a link and runnable in CI; a Unity build satisfies neither. C# and game-design skills are noted in the case study instead.
- **FieldForce** uses Expo with an offline queue rather than Kotlin. The offline-first architecture is the point, and Expo keeps the project demoable in a browser.

---

## 6. Shared standards

These apply to all twelve projects. They are enforced by `AGENTS.md`.

### Definition of done (per project)

A project is done when all of the following are true:

1. `npm install && npm run dev` (or the Python equivalent) works from a clean clone.
2. Lint, typecheck and build pass; tests pass where tests exist.
3. Seeded demo data plus a documented demo account.
4. Every feature checkbox in the project spec is either implemented or explicitly listed as out of scope.
5. README contains: problem, screenshots or a described walkthrough, feature list, stack, how to run, known limits.
6. Status row in the root README updated to `Shipped`.
7. Passed independent review and marked `— reviewed` in `TODO.md`.
8. No secrets, no real personal data, no paid keys required.

### Product quality

- **Identity:** every project has a name, a colour system, and a consistent type scale. No default Bootstrap look.
- **Realistic data:** plausible names, prices, dates and quantities — not `foo`/`bar`.
- **Accessibility:** keyboard reachable, visible focus, labelled inputs, sufficient contrast.
- **Responsive:** usable from 360 px upward.
- **Empty, loading and error states** exist; a spinner forever is a bug.
- **Copy:** written as a product would write it, in the project's own voice.

### Engineering quality

- Strict TypeScript where TypeScript is used; typed Python where practical.
- Validation at every boundary (form input, API input, file upload).
- Authorisation checked server-side, never only in the UI.
- Money in integer minor units. Dates stored as UTC.
- No cross-project imports. No shared workspace.
- Environment variables documented in `.env.example`; mock mode is the default.

### Ethics and safety

- Security tooling only assesses assets the user has proven they own or may test.
- No scraping of personal data; demo datasets are synthetic.
- AI features show confidence, citations and a human-review path.
- No dark patterns, no fake urgency, no fake testimonials.

---

## 7. How the build system works

Two roles, one queue each:

| Role | Queue | Job | Output |
| --- | --- | --- | --- |
| **Builder** | `TODO.md` | `todo-worker` | code + `— review needed` |
| **Reviewer** | `REVIEW.md` | `review-worker` | `approved` or `changes requested` |

The builder never signs off on its own work, and the reviewer never expands scope. A `TODO` item is only finished when both markers agree: ticked **and** reviewed.

### Trigger and cadence

- `opencode-cron.yml` runs **seven times a day** — 03:00, 05:30, 08:00, 10:30, 13:00, 15:30, 18:00 UTC (08:00, 10:30, 13:00, 15:30, 18:00, 20:30, 23:00 PKT). Every slot runs the builder first and the reviewer second, so each role gets seven sessions a day. Manual dispatch accepts `both`, `build`, or `review`.
- Each session is a **batch**: up to 2 build items or 3 reviews, roughly 35 minutes. A batch stops when the limit or the clock is reached, never mid-item.
- `opencode.yml` handles owner-opened issues, `/opencode` comments, and PR reviews on demand.

### The build loop

1. Check out the repository and ensure `work` exists (created from `main` on first run).
2. Read `AGENTS.md`, `PRD.md`, `TODO.md`, then the spec of the project being worked on.
3. Take the **first unchecked item** in `TODO.md` — including anything sent back with `— changes requested`.
4. If the item is too large, split it into smaller items first, then do the first one.
5. Create `opencode/todo-<run-id>-<slug>` from `work`, implement, verify, then make two commits: the work, and the tick plus `REVIEW.md` entry.
6. Merge the branch into `work` and delete it. Then take the next item, up to 2 per batch.
7. At the end of every session, write the checkpoint and log entry, and replace the single `Last updated` line at the bottom of `README.md`.

### The review loop

1. Read `REVIEW.md` and take the oldest entry with `Review: needed`.
2. Read the diff, open the touched files, and **run the checks independently**.
3. Judge four gates: correctness, safety, honesty, standards.
4. Approve → flip the entry and mark `— reviewed <date>` in `TODO.md`. Reject → return the item to `- [ ]` with `— changes requested`, record numbered findings, and add follow-up items.
5. After two rejections the item goes to **Blocked** and an issue is opened.
6. Land the verdict on `work`, up to 3 entries per batch.

### Batches, checkpoints and logs

Every session is a batch, and every batch leaves two files behind:

| File | Purpose | Rule |
| --- | --- | --- |
| `log/state.md` | Resume checkpoint: status, role, run, item, branch, phase, next action | Rewritten, never appended |
| `log/log.md` | Session history: one entry per run, tagged builder or reviewer | Appended, never rewritten |

If a session is cut off, the next session of that role reads the checkpoint, checks out the recorded branch if it still exists, and continues from the recorded phase. A builder that finds `status: reviewing` leaves it alone; a reviewer that finds `status: building` does the same. A checkpoint is only cleared by the role that wrote it.

The checkpoint moves through `implementing → committed → handoff-committed → landing → idle`. Only committed and pushed work survives a killed runner, so both roles commit as soon as something works instead of batching it at the end.

The reviewer logs no-op sessions too, so "nothing to review" is visible in the history rather than assumed.

### Ownership of branches

- `main` — released, owner-merged only.
- `work` — integration branch; receives every completed item and every verdict.
- `opencode/todo-*` — builder branches, deleted after landing.
- `opencode/review-*` — reviewer branches, deleted after landing.

### The owner's role

- Add or reorder items in `TODO.md`.
- Read `REVIEW.md` to see what was accepted, what was sent back, and why.
- Answer `question:` issues.
- Merge `work` into `main` when the batch looks good:

```bash
git checkout main
git merge work
git push
```

### Extending the queue

Adding work never requires touching the workflow:

- **Small change** → add a `- [ ]` line under the relevant project section.
- **New project** → create `projects/<slug>/README.md` from `docs/project-template.md`, add a section to `TODO.md` with its first task, and add a row to the root README table.
- **Big idea with no detail** → add one line. The builder splits it into subtasks before starting.
- **Rejected work** → the reviewer has already written the fix list; the builder picks it up automatically.

---

## 8. Milestones

| Milestone | Content | Exit criteria |
| --- | --- | --- |
| M0 — Foundations | PRD, AGENTS, TODO, README, license, workflow | Committed to `work`, automation runs green once |
| M1 — First flagship | Nexus Business Suite | Shipped, documented, in `work` |
| M2 — Phase 1 complete | Maison Store, DocuMind, SecureCheck | Four flagship projects shipped |
| M3 — Phase 2 complete | ShopFlow, FieldForce, Enterprise Hub, CyberOps | Eight projects shipped |
| M4 — Phase 3 complete | CityBites, Corporate, StorySpace, SimuWorks | Twelve projects shipped |
| M5 — Presentation | Screenshots, case studies, demo links | Root README reads as a portfolio, no dead links |

---

## 9. Success measures

- Time from "idea added to TODO" to "usable increment on `work`" — target: under 24 hours.
- Percentage of checked items that actually work when clicked — target: 100%. A dishonest checkbox is worse than an empty one.
- Percentage of shipped items that passed review on the first attempt — target: above 70%; a downward trend means the TODO items are too vague.
- Review turnaround — target: every `review needed` entry is reviewed within one scheduled run.
- Number of projects a visitor can run locally without asking a question — target: 12/12.
- Zero secrets, zero broken links, zero failing default checks on `work`.

---

## 10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Agent marks work done that is not done | Verification is mandatory; TODO is only checked after lint/typecheck/build/tests; the owner spot-checks on merge |
| Twelve unfinished projects look worse than four finished ones | Strict phase order; each project is completed before the next begins |
| Free-tier model quality varies | Small, concrete TODO items; one item per commit; honest failure reporting |
| Scheduled runs get delayed or disabled | Manual `workflow_dispatch`; repo activity keeps schedules alive |
| Merge conflicts between overlapping items | Rebase onto latest `work` before each item; conflict → abort, keep branch, note it |
| Demo features leak cost (LLM/payment keys) | Mock mode is the default; real keys are opt-in via secrets |
| Security tooling misuse | Ownership verification before any scan; passive checks only; clear acceptable-use documentation |

---

## 11. Out of scope for now

- A separate marketing site for the portfolio itself.
- Hosted live demos for every project (added later, per project, if useful).
- Multi-language interfaces.
- Real authentication providers (OAuth) — demo auth is local and clearly labelled.
- Analytics, telemetry, or user tracking of any kind.

---

## 12. Change log

| Date | Change |
| --- | --- |
| 2026-10-31 | Initial PRD: 12 projects, 3 phases, shared standards, build system |
| 2026-10-31 | Split the build system into two roles: builder (`TODO.md`) and reviewer (`REVIEW.md`), with a review gate before an item is finished |
| 2026-10-31 | Runs became batches: 7 builder and 7 reviewer sessions a day, 2 items / 3 reviews per batch, with `log/state.md` checkpoints and an append-only `log/log.md` so a cut run resumes instead of restarting |
