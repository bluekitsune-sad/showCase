# CyberOps Command Center

**Category:** 5 — I need cybersecurity help
**Built for:** IT departments, security teams and organisations with compliance obligations
**Label:** For businesses & enterprises
**Status:** Planned
**Folder:** `projects/10-cyberops-command-center`
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · RBAC

## The problem

A security team tracks findings in a spreadsheet, evidence in a shared drive, and audit questions in email. Nobody can prove a control is met, and the same critical finding sits open for months because it has no owner. Compliance season becomes a scramble.

## What it does

- See every asset and the risk it carries, ranked by what actually matters.
- Work a finding from open to verified, with an owner, an SLA and evidence attached.
- Answer "are we covered?" with control coverage and an audit-ready export.

## Scope

**In scope for v1**

- Asset inventory with ownership, criticality, environment and lifecycle states
- Vulnerability and finding management with severity, CVSS, affected assets and SLA dates
- Risk scoring and a prioritised remediation queue
- Compliance control catalogue with evidence, coverage percentages and assessment history
- Team assignments and workload view
- Executive dashboard with trend snapshots
- Audit-ready PDF and CSV export

**Out of scope for v1**

- Live scanner integrations (import only)
- Automatic ticket creation in external trackers
- Asset discovery on the network
- Full GRC framework certification mapping

## Data model

`User`, `Team`, `Asset`, `AssetGroup`, `Vulnerability`, `Finding`, `FindingAsset`, `Evidence`, `Control`, `ControlMapping`, `Assessment`, `RiskSnapshot`, `Assignment`, `AuditEntry`.

Seed: 60 assets, 80 findings across severities and states, 40 controls mapped to two frameworks, 6 months of risk snapshots, 6 users across two teams.

## Definition of done

- Clean-clone setup documented and working
- Lint, typecheck and build pass
- Risk score is deterministic and explained in the UI
- A finding cannot be closed without an owner and evidence
- Coverage percentages reconcile with mapped controls
- README documents the scoring model, roles and limits

## Notes for the build

Design direction: operations room — dark-capable palette, dense tables, severity as the only saturated colour, charts that read at a glance.

Tricky parts: the risk formula must be written down and tested, SLA dates must derive from severity, and trend snapshots must be point-in-time copies rather than live queries.
