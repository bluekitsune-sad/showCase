# Showcase

Software that solves a specific, recognizable problem — for someone with an idea, and for companies whose operations have outgrown spreadsheets.

This repository is my working portfolio. Each entry is a self-contained product build with its own stack, realistic demo data, and a written case study: a storefront, a retail POS, a business suite, an AI document assistant, a security scanner, and more. The goal is never "another CRUD app" — it is a demo you can click through and a codebase you can read.

**Building in public.** I ship in small, verified increments, so the status column below changes over time.

---

## What I build

| Area | In practice |
| --- | --- |
| **Websites** | Storefronts and corporate sites that load fast, rank well, and hand content control back to the owner. |
| **Business applications** | Inventory, sales, CRM, HR and reporting tools that replace manual record keeping. |
| **Mobile apps** | Customer-facing ordering and field-operations apps, including offline-first flows. |
| **AI products** | Document understanding and workflow automation with citations and human review. |
| **Cybersecurity** | Authorized, passive security assessment and risk management tooling. |
| **Custom software** | Readers, simulators, and anything that does not fit a template. |

---

## The work

### 1 — I need a website

- **[Maison Store](projects/01-maison-store)** — *For individuals & customers* — Premium fashion storefront: catalog and filters, variants, cart and checkout, accounts, order tracking, discount codes. `Next.js · TypeScript · Tailwind · Prisma`
- **[Corporate Digital Presence](projects/02-corporate-cms)** — *For businesses* — Corporate site with a real CMS: service pages, team profiles, case studies, blog, lead capture, SEO. `Next.js · Node · RBAC`

### 2 — I need a business application

- **[ShopFlow](projects/03-shopflow)** — *For individuals & customers* — Retail POS and inventory for small shops: stock alerts, purchases, barcodes, expenses, receipts, profit reports. `Next.js · TypeScript · Prisma`
- **[Nexus Business Suite](projects/04-nexus-business-suite)** — *For businesses* — CRM plus operations: leads, customers, HR and attendance, tasks, department permissions, audit trail, executive dashboards. `Next.js · TypeScript · Prisma · RBAC`

### 3 — I need a mobile app

- **[CityBites](projects/05-citybites)** — *For individuals & customers* — Restaurant discovery and ordering: menus, ratings, cart, order tracking, loyalty, owner dashboard. `React Native · Expo · TypeScript`
- **[FieldForce](projects/06-fieldforce)** — *For businesses* — Field operations: jobs, GPS attendance, photo uploads, offline sync, manager reporting. `React Native · Expo · TypeScript`

### 4 — I have an AI idea

- **[DocuMind](projects/07-documind)** — *For individuals & customers* — Upload a document, ask it questions, get cited answers, summaries, notes and flashcards. `Python · FastAPI · RAG`
- **[Enterprise Intelligence Hub](projects/08-enterprise-intelligence-hub)** — *For businesses* — Document ingestion, classification, extraction, automated reports, approval workflows, audit logs. `Python · FastAPI · RAG · Jobs`

### 5 — I need cybersecurity help

- **[SecureCheck](projects/09-securecheck)** — *For individuals & customers* — Authorized website assessment: TLS, headers, safe configuration, dependency risk, PDF report. `Python · FastAPI · OWASP`
- **[CyberOps Command Center](projects/10-cyberops-command-center)** — *For businesses* — Asset inventory, vulnerability lifecycle, risk scoring, compliance mapping, executive dashboards. `Next.js · TypeScript · RBAC`

### 6 — I need something else

- **[StorySpace](projects/11-storyspace)** — *For individuals & customers* — Digital publishing: bookstore, in-browser reader, bookmarks, reviews, author dashboard. `Next.js · Prisma · Tailwind`
- **[SimuWorks](projects/12-simuworks)** — *For businesses* — Gamified business simulation for training: scenarios, decisions, scoring, leaderboards, analytics. `TypeScript · React · Simulation`

---

## Status

`Planned` · `In progress` · `Shipped`

| # | Project | For | Status |
| --- | --- | --- | --- |
| 01 | [Maison Store](projects/01-maison-store) | Individuals & customers | Planned |
| 02 | [Corporate Digital Presence](projects/02-corporate-cms) | Businesses | Planned |
| 03 | [ShopFlow](projects/03-shopflow) | Individuals & customers | Planned |
| 04 | [Nexus Business Suite](projects/04-nexus-business-suite) | Businesses | In progress |
| 05 | [CityBites](projects/05-citybites) | Individuals & customers | Planned |
| 06 | [FieldForce](projects/06-fieldforce) | Businesses | Planned |
| 07 | [DocuMind](projects/07-documind) | Individuals & customers | Planned |
| 08 | [Enterprise Intelligence Hub](projects/08-enterprise-intelligence-hub) | Businesses | Planned |
| 09 | [SecureCheck](projects/09-securecheck) | Individuals & customers | Planned |
| 10 | [CyberOps Command Center](projects/10-cyberops-command-center) | Businesses | Planned |
| 11 | [StorySpace](projects/11-storyspace) | Individuals & customers | Planned |
| 12 | [SimuWorks](projects/12-simuworks) | Businesses | Planned |

---

## How the repository is organised

```
projects/<slug>/        one product, one stack, one README
  README.md             problem, scope, screenshots, how to run it
PRD.md                  the portfolio plan and shared standards
TODO.md                 the build queue
AGENTS.md               conventions for working in this repo
```

Every project is standalone. It has its own manifest, its own dependencies and its own scripts — no shared workspace, no cross-project imports. Pick a folder, run it, and it works.

## Running a project

Each project README lists its exact commands. The shape is always the same:

```bash
cd projects/<slug>
npm install            # or: pip install -r requirements.txt
npm run dev            # or: uvicorn app.main:app --reload
```

Every project is built to run from a clean clone with seeded demo data and a demo account, so there is nothing to configure before trying it. Features that would normally need a paid API key (LLMs, payments) default to a deterministic local mock mode.

## Stack

TypeScript and Next.js for most interfaces. Node or FastAPI behind them. PostgreSQL in production, SQLite for the local demo. React Native and Expo for mobile. Python for AI and security work. Docker and GitHub Actions for delivery.

## License

MIT — see [LICENSE](LICENSE). Use the code, learn from it, build on it.

## Contact

[github.com/bluekitsune-sad](https://github.com/bluekitsune-sad) — open an issue on any project if you want to talk about building something similar.

<!-- last-updated -->
_Last updated: 12 November 2026, 13:39 UTC._
