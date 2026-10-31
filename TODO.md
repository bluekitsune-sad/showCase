# TODO

The build queue. The builder reads this file from top to bottom, takes the **first unchecked `- [ ]` item**, finishes it, verifies it, and ticks it `- [x]`. Order is priority. The reviewer then signs it off — see `REVIEW.md`.

**Lifecycle of an item**

```text
- [ ] `P04-1` ...                                  picked up
- [x] `P04-1` ... — review needed                  built, awaiting the reviewer
- [x] `P04-1` ... — reviewed 2026-10-31            approved
- [ ] `P04-1` ... — changes requested              sent back, must be fixed
```

Only the builder writes `— review needed`. Only the reviewer writes `— reviewed` or `— changes requested`.

**Rules**

- One line = one sitting of work. If an item is bigger than that, split it into smaller `- [ ]` lines first.
- Never delete an item. Finished items stay as history.
- Never reorder someone else's items.
- Anything under **Blocked** is skipped until the owner answers.
- An item with `— changes requested` is back in the queue: read the findings in `REVIEW.md` before touching it.

**Adding work**

- Small change → add a `- [ ]` line under the matching project, with the next free ID.
- New project → copy `docs/project-template.md` to `projects/<slug>/README.md`, add a section here with its first task, and add a row to the root README table.
- Rough idea → add one line anyway. The worker splits it before starting.

---

## Phase 1 — Flagship work

### 04 · Nexus Business Suite — `projects/04-nexus-business-suite`

- [ ] `P04-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/04-nexus-business-suite`: design tokens, app shell (sidebar, topbar, theme), Prisma schema for users, departments, employees, leads, customers, tasks, activities, and a seed script with realistic demo data.
- [ ] `P04-2` Add authentication and department-scoped RBAC (owner, admin, manager, staff) with demo accounts, a permission helper used server-side, and a short note in the README explaining the role matrix.
- [ ] `P04-3` Build the CRM surface: leads and customer lists with search and filters, lead pipeline board by stage, customer detail page with contacts, notes and activity timeline.
- [ ] `P04-4` Build the HR surface: employee directory, attendance log with check-in/out, leave requests with approve/reject, and recruitment pipeline columns.
- [ ] `P04-5` Build tasks and projects: project list, task board with assignee and due date, notifications feed, and an append-only activity log written on every mutation.
- [ ] `P04-6` Build the executive dashboard (revenue pipeline, headcount, attendance rate, open tasks, trend charts), a reports page with CSV export, audit trail viewer, plus responsive and accessibility pass; update the project README case study.

### 01 · Maison Store — `projects/01-maison-store`

- [ ] `P01-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/01-maison-store`: design system (type scale, colours, spacing), storefront shell (announcement bar, nav, mega-menu, footer), and seed data for collections, products, variants, and images.
- [ ] `P01-2` Build the storefront home page: hero, featured collection, product grid, editorial sections, testimonials, newsletter block — all driven by seeded data, responsive from 360 px.
- [ ] `P01-3` Build catalog and product detail: collection and category pages, sort and filter (price, size, colour, availability), product page with variant selection, gallery, size guide, and related products.
- [ ] `P01-4` Build cart and checkout: persistent cart, quantity and variant editing, discount code validation, address form with server-side validation, order summary, and a mock payment step (no real charge).
- [ ] `P01-5` Build customer accounts: sign in/up, order history, order tracking with per-item status, saved addresses, and wishlist.
- [ ] `P01-6` Polish Maison Store: SEO metadata and JSON-LD, image optimisation, empty/loading/error states, accessibility pass, and a README with case study and screenshots.

### 07 · DocuMind — `projects/07-documind`

- [ ] `P07-1` Scaffold DocuMind in `projects/07-documind`: FastAPI service in `api/` with typed settings and health check, Next.js frontend in `web/`, `.env.example`, and a `Makefile` with `make api` / `make web`.
- [ ] `P07-2` Build document ingestion: PDF and text upload with size and type validation, text extraction (pypdf), chunking with overlap, local embedding generation, and a persisted index in SQLite.
- [ ] `P07-3` Build the document workspace: upload panel, document list, per-document overview (pages, chunks, status), delete, and re-index, with progress and error states.
- [ ] `P07-4` Build cited Q&A: retrieval over the index, answer generation through a provider interface with a deterministic mock by default, inline citations that open the source passage, and conversation history.
- [ ] `P07-5` Build study tools: document summary, key-information extraction, generated notes, flashcards, and export to Markdown.
- [ ] `P07-6` Add API tests with pytest, an evaluation fixture set for retrieval, a Dockerfile, and a README with architecture diagram, setup, and screenshots.

### 09 · SecureCheck — `projects/09-securecheck`

- [ ] `P09-1` Scaffold SecureCheck in `projects/09-securecheck`: FastAPI in `api/`, Next.js in `web/`, `.env.example`, and a README section stating acceptable use (assets you own or are authorised to test).
- [ ] `P09-2` Build target onboarding with ownership verification: domain submission, DNS TXT or file challenge, verification state machine, and a check that blocks scanning unverified targets.
- [ ] `P09-3` Implement passive checks: DNS records, TLS certificate and protocol configuration, HTTP security headers with grading, cookie flags, and safe public-configuration inspection — no exploitation, no brute force.
- [ ] `P09-4` Add dependency risk: parse an uploaded `package.json` or `requirements.txt`, match against a bundled advisory snapshot, and produce findings with severity and fix versions.
- [ ] `P09-5` Add risk scoring, an AI-assisted plain-English explanation per finding (mock mode by default), remediation guidance, and scan history with diffs since the previous run.
- [ ] `P09-6` Add PDF report export, API tests, security headers and rate limiting on our own API, and a README with methodology, limits and screenshots.

---

## Phase 2 — Expand the range

### 03 · ShopFlow — `projects/03-shopflow`

- [ ] `P03-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/03-shopflow`: shop setup, category and product models, and seed data with a realistic product catalogue.
- [ ] `P03-2` Build product and inventory management: product CRUD, variants, stock levels, low-stock alerts, stock adjustments with reason codes, and a stock history trail.
- [ ] `P03-3` Build the POS screen: fast product search, barcode input, cart, quantity and discount edits, customer attach, and sale completion that decrements stock atomically.
- [ ] `P03-4` Build purchasing and suppliers: supplier records, purchase orders, goods received that increases stock, and supplier balance tracking.
- [ ] `P03-5` Build receipts and printing: printable receipt layout, thermal-size CSS, barcode and label generation, and an exportable sales list.
- [ ] `P03-6` Build reports (sales, profit, expenses, top products, stock value) with date ranges and CSV export, plus README case study and screenshots.

### 06 · FieldForce — `projects/06-fieldforce`

- [ ] `P06-1` Scaffold the Expo + TypeScript app in `projects/06-fieldforce` with a shared UI kit, tab navigation, and a demo login; confirm it runs on web.
- [ ] `P06-2` Build the employee side: profile, today's jobs list, job detail with checklist, status transitions, and notes.
- [ ] `P06-3` Add GPS check-in/out with permission handling, a geofence radius check, and an attendance history screen that works when location is denied.
- [ ] `P06-4` Add photo and document capture: camera and library picker, compression, local upload queue, and per-job attachments.
- [ ] `P06-5` Make it offline-first: local persistence, queued mutations, sync with conflict handling, and a visible sync state banner.
- [ ] `P06-6` Build the manager view (assignments, completion rates, map of check-ins) and a README with architecture notes and screenshots.

### 08 · Enterprise Intelligence Hub — `projects/08-enterprise-intelligence-hub`

- [ ] `P08-1` Scaffold the FastAPI + Next.js project in `projects/08-enterprise-intelligence-hub` with a job runner, shared models, and seeded tenant data.
- [ ] `P08-2` Build ingestion and classification: batch upload, document type detection, metadata extraction, and a processing queue with visible job states.
- [ ] `P08-3` Build AI field extraction with confidence, per-field source highlighting, and a human verification screen that records who corrected what.
- [ ] `P08-4` Build approval workflows: rule-based routing, reviewer inbox, approve/reject with comments, and a full state history per document.
- [ ] `P08-5` Build automated report generation from processed documents (scheduled and on demand) with templates and PDF/DOCX export.
- [ ] `P08-6` Build knowledge-base search, audit logs, usage monitoring, API keys for integrations, and a README with architecture and screenshots.

### 10 · CyberOps Command Center — `projects/10-cyberops-command-center`

- [ ] `P10-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/10-cyberops-command-center`: asset, vulnerability, finding, control and user models, plus seeded enterprise data.
- [ ] `P10-2` Build asset inventory: asset CRUD, ownership, criticality, environment tags, CSV import, and lifecycle states.
- [ ] `P10-3` Build vulnerability management: findings intake, severity and CVSS, affected assets, SLA dates, and remediation status transitions.
- [ ] `P10-4` Build risk scoring and prioritisation: weighted score from criticality, exposure and severity, a ranked queue, and trend snapshots over time.
- [ ] `P10-5` Build compliance mapping: control catalogue (ISO 27001 / SOC 2 style), evidence attachments, coverage percentages, and assessment history.
- [ ] `P10-6` Build the executive dashboard, team assignments, audit-ready PDF/CSV export, RBAC, and a README case study with screenshots.

---

## Phase 3 — Diversify

### 05 · CityBites — `projects/05-citybites`

- [ ] `P05-1` Scaffold the Expo + TypeScript app in `projects/05-citybites` with a UI kit, tab navigation, and seeded restaurants, menus and categories; confirm it runs on web.
- [ ] `P05-2` Build discovery: home feed, search, category chips, sort by rating/delivery time/price, restaurant cards and restaurant detail with menu sections.
- [ ] `P05-3` Build the ordering flow: item customisation, cart, delivery vs pickup, address selection, checkout with a mock payment, and order tracking states.
- [ ] `P05-4` Build the account area: sign in/up, order history, favourites, saved addresses, and a loyalty points balance with a rewards screen.
- [ ] `P05-5` Build the restaurant owner dashboard: incoming orders queue, menu availability toggles, and a simple sales summary.
- [ ] `P05-6` Add push-notification plumbing (mock in web), polish states and accessibility, and write the README with screenshots.

### 02 · Corporate Digital Presence — `projects/02-corporate-cms`

- [ ] `P02-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/02-corporate-cms`: site shell, navigation model, design tokens, and seeded company content.
- [ ] `P02-2` Build the public site: home, services, about, team and leadership, contact, with a consistent layout and real copy.
- [ ] `P02-3` Build case studies and insights: case study index and detail templates, blog index and article pages, tags and related content, RSS and sitemap.
- [ ] `P02-4` Build the CMS: editor role sign-in, draft/publish workflow, rich-text or MDX editing, media library, and revision history.
- [ ] `P02-5` Build lead management: contact form with spam protection and server validation, leads inbox with status and assignment, and email notification via a mock transport.
- [ ] `P02-6` Add SEO (metadata, Open Graph, structured data), analytics hook, performance pass, and README case study with screenshots.

### 11 · StorySpace — `projects/11-storyspace`

- [ ] `P11-1` Scaffold Next.js + TypeScript + Tailwind + Prisma/SQLite in `projects/11-storyspace`: author, book, chapter, review and progress models with seeded books.
- [ ] `P11-2` Build the bookstore: home, category browsing, search, book detail with sample chapter, and author profile pages.
- [ ] `P11-3` Build the reader: paginated or scroll mode, typography controls, bookmarks, reading progress persistence, and a table of contents.
- [ ] `P11-4` Build the personal library: purchased and saved books, continue-reading shelf, reading statistics, and highlights.
- [ ] `P11-5` Build the author dashboard: create and edit books and chapters, upload cover art, set pricing, draft/publish, and see sales.
- [ ] `P11-6` Add reviews and ratings with moderation, a mock checkout for purchases, accessibility pass, and README with screenshots.

### 12 · SimuWorks — `projects/12-simuworks`

- [ ] `P12-1` Scaffold the Vite + React + TypeScript simulation in `projects/12-simuworks`: scenario schema, seeded company scenario, and the core simulation loop with a tick engine.
- [ ] `P12-2` Build the player experience: briefing, decision cards with consequences, budget and staff resources, quarter-by-quarter progression, and a results screen.
- [ ] `P12-3` Build scoring and evaluation: KPI model (profit, morale, cash, reputation), weighted scoring, end-of-run report, and replay.
- [ ] `P12-4` Build the admin side: scenario builder, decision and effect editor, validation, and publishing to players.
- [ ] `P12-5` Build progress tracking: cohort assignment, per-employee results, leaderboard, achievements, and a training analytics dashboard.
- [ ] `P12-6` Polish the simulation UI (charts, feedback, transitions), add unit tests for the engine, and write the README with screenshots.

---

## Housekeeping

- [ ] `HK-1` Replace the placeholder status values in the root README table with real ones as projects ship, and check every internal link resolves.
- [ ] `HK-2` Add a short "case study" section to any shipped project README that still lacks one (problem, approach, result, what I would do next).
- [ ] `HK-3` Run a dependency audit across shipped projects and remove anything unused.

## Blocked — do NOT implement

_Nothing blocked. When an item needs a human decision, move it here with a link to the `question:` issue._
